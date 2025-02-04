import React from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";

const Logout = () => {
    const navigate = useNavigate();

    // Function to handle logout
    const handleLogout = () => {
        // Clear user session (remove token from localStorage)
        localStorage.removeItem('token');
        localStorage.removeItem('rememberMe'); // Clear rememberMe if set

        // Navigate back to login page after logout
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-blue-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md text-center">
                <h2 className="text-3xl font-bold text-white mb-8">
                    Logout
                </h2>
                <p className="text-gray-400 mb-6">
                    Are you sure you want to log out?
                </p>
                <button
                    onClick={handleLogout}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 flex items-center justify-center"
                >
                    <FaSignOutAlt className="mr-2" /> Log Out
                </button>
            </div>
        </div>
    );
};

export default Logout;