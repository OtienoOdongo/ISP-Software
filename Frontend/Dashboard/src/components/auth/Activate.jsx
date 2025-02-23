



// import React, { useState, useCallback, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { FaSpinner, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
// import api from "../../../api";
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


import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaSpinner, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import api from "../../../api";
import { useAuth } from "../../context/AuthContext";

const Activate = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
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
            setError(error.response?.data?.detail || "Failed to activate account.");
        } finally {
            setLoading(false);
        }
    }, [uid, token, navigate]);

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-blue-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md transform transition-all ease-in-out duration-500 hover:shadow-3xl hover:-translate-y-1">
                <h2 className="text-4xl font-extrabold text-center text-white mb-8">Account Activation</h2>

                {loading && (
                    <div className="text-center">
                        <FaSpinner className="animate-spin text-blue-500 text-4xl mx-auto mb-4" />
                        <p className="text-gray-400">Activating your account...</p>
                    </div>
                )}

                {success && (
                    <div className="text-center">
                        <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-4" />
                        <p className="text-white">Account activated successfully!</p>
                        <p className="text-gray-400 mt-2">Redirecting to login in 3 seconds...</p>
                    </div>
                )}

                {error && (
                    <div className="text-center">
                        <FaExclamationCircle className="text-red-500 text-4xl mx-auto mb-4" />
                        <p className="text-red-500">{error}</p>
                        <button
                            onClick={() => navigate("/signup")}
                            className="mt-4 text-blue-400 hover:underline"
                        >
                            Try signing up again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Activate;