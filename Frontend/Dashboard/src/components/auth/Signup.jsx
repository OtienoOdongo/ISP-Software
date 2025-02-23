




// import React, { useState, useCallback, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
// import api from "../../../api";
// import { useAuth } from "../../context/AuthContext"; // Import for consistency, not used yet

// const Signup = () => {
//     const [formState, setFormState] = useState({
//         email: "",
//         password: "",
//         confirmPassword: "",
//         name: "",
//     });
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [showPassword, setShowPassword] = useState(false);
//     const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//     const navigate = useNavigate();
//     const { isAuthenticated } = useAuth(); // Optional: redirect if already logged in

//     const handleChange = useCallback((e) => {
//         const { name, value } = e.target;
//         setFormState((prev) => ({ ...prev, [name]: value }));
//     }, []);

//     const handleSubmit = useCallback(
//         async (e) => {
//             e.preventDefault();
//             setLoading(true);
//             setError("");

//             if (formState.password !== formState.confirmPassword) {
//                 setError("Passwords do not match");
//                 setLoading(false);
//                 return;
//             }

//             try {
//                 await api.post("/api/auth/users/", {
//                     email: formState.email,
//                     password: formState.password,
//                     re_password: formState.confirmPassword,
//                     name: formState.name,
//                 });
//                 navigate("/login", { replace: true });
//             } catch (error) {
//                 setError(error.response?.data?.email?.[0] || "Signup failed.");
//             } finally {
//                 setLoading(false);
//             }
//         },
//         [formState, navigate]
//     );

//     const togglePasswordVisibility = useCallback(() => {
//         setShowPassword(!showPassword);
//     }, [showPassword]);

//     const toggleConfirmPasswordVisibility = useCallback(() => {
//         setShowConfirmPassword(!showConfirmPassword);
//     }, [showConfirmPassword]);

//     // Optional: Redirect if already authenticated
//     useEffect(() => {
//         if (isAuthenticated) {
//             navigate("/dashboard", { replace: true });
//         }
//     }, [isAuthenticated, navigate]);

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-blue-900">
//             <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md transform transition-all ease-in-out duration-500 hover:shadow-3xl hover:-translate-y-1">
//                 <h2 className="text-4xl font-extrabold text-center text-white mb-8">Sign Up</h2>
//                 <form onSubmit={handleSubmit}>
//                     <div className="mb-6">
//                         <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
//                         <div className="relative">
//                             <FaUser className="absolute left-3 top-3 text-gray-500" />
//                             <input
//                                 type="text"
//                                 name="name"
//                                 value={formState.name}
//                                 onChange={handleChange}
//                                 className="pl-10 pr-4 shadow appearance-none border border-gray-600 rounded-lg w-full py-3 px-3 text-white bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 placeholder="James Kirwa"
//                                 required
//                             />
//                         </div>
//                     </div>

//                     <div className="mb-6">
//                         <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
//                         <div className="relative">
//                             <FaEnvelope className="absolute left-3 top-3 text-gray-500" />
//                             <input
//                                 type="email"
//                                 name="email"
//                                 value={formState.email}
//                                 onChange={handleChange}
//                                 className="pl-10 pr-4 shadow appearance-none border border-gray-600 rounded-lg w-full py-3 px-3 text-white bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 placeholder="example@mail.com"
//                                 required
//                             />
//                         </div>
//                     </div>

//                     <div className="mb-6">
//                         <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
//                         <div className="relative">
//                             <FaLock className="absolute left-3 top-3 text-gray-500" />
//                             <input
//                                 type={showPassword ? "text" : "password"}
//                                 name="password"
//                                 value={formState.password}
//                                 onChange={handleChange}
//                                 className="pl-10 pr-10 shadow appearance-none border border-gray-600 rounded-lg w-full py-3 px-3 text-white bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 placeholder="**********"
//                                 required
//                             />
//                             <button
//                                 type="button"
//                                 onClick={togglePasswordVisibility}
//                                 className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
//                             >
//                                 {showPassword ? <FaEyeSlash /> : <FaEye />}
//                             </button>
//                         </div>
//                     </div>

//                     <div className="mb-6">
//                         <label className="block text-sm font-medium text-gray-400 mb-2">Confirm Password</label>
//                         <div className="relative">
//                             <FaLock className="absolute left-3 top-3 text-gray-500" />
//                             <input
//                                 type={showConfirmPassword ? "text" : "password"}
//                                 name="confirmPassword"
//                                 value={formState.confirmPassword}
//                                 onChange={handleChange}
//                                 className="pl-10 pr-10 shadow appearance-none border border-gray-600 rounded-lg w-full py-3 px-3 text-white bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                 placeholder="**********"
//                                 required
//                             />
//                             <button
//                                 type="button"
//                                 onClick={toggleConfirmPasswordVisibility}
//                                 className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
//                             >
//                                 {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
//                             </button>
//                         </div>
//                     </div>

//                     {error && <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>}

//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
//                     >
//                         {loading ? <FaSpinner className="animate-spin" /> : "Sign Up"}
//                     </button>
//                 </form>

//                 <div className="mt-6 text-center">
//                     <p className="text-sm text-gray-400">
//                         Already have an account?{" "}
//                         <button
//                             type="button"
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

// export default Signup;



import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import api from "../../../api";
import { useAuth } from "../../context/AuthContext";

const Signup = () => {
    const [formState, setFormState] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

            if (formState.password !== formState.confirmPassword) {
                setError("Passwords do not match");
                setLoading(false);
                return;
            }

            try {
                await api.post("/api/auth/users/", {
                    email: formState.email,
                    password: formState.password,
                    re_password: formState.confirmPassword,
                    name: formState.name,
                });
                navigate("/login", { replace: true });
            } catch (error) {
                setError(error.response?.data?.email?.[0] || "Signup failed.");
            } finally {
                setLoading(false);
            }
        },
        [formState, navigate]
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
                <h2 className="text-4xl font-extrabold text-center text-white mb-8">Sign Up</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                        <div className="relative">
                            <FaUser className="absolute left-3 top-3 text-gray-500" />
                            <input
                                type="text"
                                name="name"
                                value={formState.name}
                                onChange={handleChange}
                                className="pl-10 pr-4 shadow appearance-none border border-gray-600 rounded-lg w-full py-3 px-3 text-white bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="James Kirwa"
                                required
                            />
                        </div>
                    </div>

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

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-3 text-gray-500" />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formState.password}
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
                        <label className="block text-sm font-medium text-gray-400 mb-2">Confirm Password</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-3 text-gray-500" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formState.confirmPassword}
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
                        {loading ? <FaSpinner className="animate-spin" /> : "Sign Up"}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-400">
                        Already have an account?{" "}
                        <button
                            type="button"
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

export default Signup;