import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";

const VerifyEmail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "your email"; // Fallback if email isn’t passed
    const [countdown, setCountdown] = useState(10); // Start countdown at 10 seconds

    // Countdown logic and auto-redirect
    useEffect(() => {
        if (countdown > 0) {
            const timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000); // Decrease every second
            return () => clearInterval(timer); // Cleanup on unmount or update
        } else {
            navigate("/login", { replace: true }); // Auto-redirect when countdown hits 0
        }
    }, [countdown, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-blue-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md transform transition-all ease-in-out duration-500 hover:shadow-3xl hover:-translate-y-1">
                <h2 className="text-4xl font-extrabold text-center text-white mb-8">Verify Your Email</h2>
                <div className="text-center">
                    <FaEnvelope className="text-blue-500 text-4xl mx-auto mb-4" />
                    <p className="text-white mb-4">
                        We’ve sent a verification link to <span className="font-semibold">{email}</span>. Please check your inbox (and spam/junk folder) to activate your account.
                    </p>
                    <p className="text-gray-400 mb-6">
                        Once verified, you’ll be able to log in. Redirecting to login in {countdown} seconds...
                    </p>
                    <button
                        onClick={() => navigate("/login")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        Go to Login Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;