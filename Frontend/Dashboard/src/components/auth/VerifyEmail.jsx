



import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEnvelope, FaSpinner, FaArrowLeft } from "react-icons/fa";
import { RiMailCheckLine } from "react-icons/ri";
import { motion } from "framer-motion"; // Added for animations

const VerifyEmail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "your email";
    const [countdown, setCountdown] = useState(10);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        let timer;
        if (countdown > 0 && !isHovering) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else if (countdown === 0 && !isHovering) {
            navigate("/login", { replace: true });
        }
        return () => clearInterval(timer);
    }, [countdown, navigate, isHovering]);

    const handleMouseEnter = () => {
        setIsHovering(true);
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="bg-gray-800/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700/50"
            >
                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/signup")}
                    className="flex items-center text-gray-400 hover:text-blue-400 mb-4 transition-colors duration-200"
                >
                    <FaArrowLeft className="mr-2" />
                    Back to Sign Up
                </motion.button>

                <div className="flex justify-center mb-6">
                    <RiMailCheckLine className="text-gray-400 text-5xl" />
                </div>
                <h2 className="text-3xl font-bold text-center text-white mb-2">
                    Verify Your Email
                </h2>
                
                <div className="text-center">
                    <p className="text-gray-400 mb-6">
                        We've sent a verification link to <span className="text-white font-medium">{email}</span>. 
                        Please check your inbox (and spam folder) to complete registration.
                    </p>

                    <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                        <div className="flex items-center justify-center">
                            <FaEnvelope className="text-blue-400 text-2xl mr-3" />
                            <div>
                                <p className="text-sm font-medium text-white">
                                    Didn't receive the email?
                                </p>
                                <p className="text-xs text-gray-400">
                                    Check spam or request a new link
                                </p>
                            </div>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/login")}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 px-4 rounded-lg font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 relative overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center justify-center">
                            Go to Login
                            {!isHovering && (
                                <span className="ml-2 text-xs bg-gray-900/50 px-2 py-1 rounded">
                                    {countdown}s
                                </span>
                            )}
                        </span>
                        {!isHovering && (
                            <motion.span 
                                initial={{ width: "0%" }}
                                animate={{ width: `${100 - (countdown * 10)}%` }}
                                transition={{ duration: 1, ease: "linear" }}
                                className="absolute bottom-0 left-0 h-1 bg-blue-400"
                            />
                        )}
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default React.memo(VerifyEmail);