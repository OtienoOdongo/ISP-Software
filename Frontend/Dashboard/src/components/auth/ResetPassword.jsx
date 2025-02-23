

// import React, { useState, useCallback, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaEnvelope, FaSpinner, FaCheckCircle } from "react-icons/fa";
// import api from "../../../api";
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


import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaSpinner, FaCheckCircle } from "react-icons/fa";
import api from "../../../api";
import { useAuth } from "../../context/AuthContext";

const ResetPassword = () => {
    const [formState, setFormState] = useState({ email: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
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

            try {
                await api.post("/api/auth/users/reset_password/", { email: formState.email });
                setSuccess(true);
            } catch (error) {
                setError(error.response?.data?.detail || "Failed to send reset email.");
            } finally {
                setLoading(false);
            }
        },
        [formState.email]
    );

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
                            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-3 text-gray-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formState.email}
                                    onChange={handleChange}
                                    className="pl-10 pr-4 shadow appearance-none border border-gray-600 rounded-lg w-full py-3 px-3 text-white bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="example@mail.com"
                                    required
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            {loading ? <FaSpinner className="animate-spin" /> : "Send Reset Link"}
                        </button>
                    </form>
                ) : (
                    <div className="text-center">
                        <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-4" />
                        <p className="text-white">Reset link sent!</p>
                        <p className="text-gray-400 mt-2">Check your email to reset your password.</p>
                        <button
                            onClick={() => navigate("/login")}
                            className="mt-4 text-blue-400 hover:underline"
                        >
                            Back to Login
                        </button>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-400">
                        Remembered your password?{" "}
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

export default ResetPassword;