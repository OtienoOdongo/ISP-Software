// import React, { useState, useCallback, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaGoogle, FaSpinner } from "react-icons/fa";

// const LoginSignup = () => {
//     const [formState, setFormState] = useState({
//         isLogin: true,
//         email: "",
//         password: "",
//         confirmPassword: "", // New field for confirming password
//         name: "",
//         rememberMe: false,
//     });
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [showPassword, setShowPassword] = useState(false);
//     const [showConfirmPassword, setShowConfirmPassword] = useState(false); // New state for confirm password visibility
//     const navigate = useNavigate();

//     const handleChange = useCallback((e) => {
//         const { name, value, type, checked } = e.target;
//         setFormState((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
//     }, []);

//     const handleSubmit = useCallback(
//         async (e) => {
//             e.preventDefault();
//             setLoading(true);
//             setError("");

//             // Validate passwords match during signup
//             if (!formState.isLogin && formState.password !== formState.confirmPassword) {
//                 setError("Passwords do not match");
//                 setLoading(false);
//                 return;
//             }

//             const { email, password, name, rememberMe } = formState;
//             try {
//                 const apiEndpoint = formState.isLogin ? "/api/login" : "/api/signup";
//                 const response = await fetch(apiEndpoint, {
//                     method: "POST",
//                     headers: {
//                         "Content-Type": "application/json",
//                     },
//                     body: JSON.stringify({
//                         email,
//                         password,
//                         name: formState.isLogin ? undefined : name,
//                         rememberMe,
//                     }),
//                 });

//                 if (!response.ok) {
//                     const errorData = await response.json();
//                     throw new Error(errorData.message || "An error occurred");
//                 }

//                 console.log(formState.isLogin ? "Logged in successfully" : "Signed up successfully");
//                 if (rememberMe) {
//                     localStorage.setItem('rememberMe', 'true');
//                 }
//                 navigate("/dashboard", { replace: true });
//             } catch (error) {
//                 setError(error.message);
//             } finally {
//                 setLoading(false);
//             }
//         },
//         [formState, navigate]
//     );

//     const toggleForm = useCallback(() => {
//         setFormState((prev) => ({
//             ...prev,
//             isLogin: !prev.isLogin,
//             name: "",
//             email: "",
//             password: "",
//             confirmPassword: "", // Reset confirm password on form toggle
//             rememberMe: false,
//         }));
//         setError(""); // Clear errors on form toggle
//     }, []);

//     const togglePasswordVisibility = useCallback(() => {
//         setShowPassword(!showPassword);
//     }, [showPassword]);

//     const toggleConfirmPasswordVisibility = useCallback(() => {
//         setShowConfirmPassword(!showConfirmPassword);
//     }, [showConfirmPassword]);

//     const handleForgotPassword = useCallback(() => {
//         console.log("Forgot Password clicked");
//         navigate("/forgot-password");
//     }, [navigate]);

//     const handleGoogleLogin = useCallback(() => {
//         console.log("Google Login clicked");
//         // Implement Google OAuth logic here
//     }, []);

//     useEffect(() => {
//         const token = localStorage.getItem("token");
//         if (token) {
//             navigate("/dashboard", { replace: true });
//         }
//         // Check if "Remember Me" was checked in the last session
//         if (localStorage.getItem('rememberMe') === 'true') {
//             setFormState(prev => ({ ...prev, rememberMe: true }));
//         }
//     }, [navigate]);

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-blue-900">
//             <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md transform transition-all ease-in-out duration-500 hover:shadow-3xl hover:-translate-y-1">
//                 <h2 className="text-4xl font-extrabold text-center text-white mb-8">
//                     {formState.isLogin ? "Login" : "Sign Up"}
//                 </h2>

//                 <form onSubmit={handleSubmit}>
//                     {!formState.isLogin && (
//                         <div className="mb-6">
//                             <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
//                             <div className="relative">
//                                 <FaUser className="absolute left-3 top-3 text-gray-500" />
//                                 <input
//                                     type="text"
//                                     name="name"
//                                     value={formState.name}
//                                     onChange={handleChange}
//                                     className="pl-10 pr-4 shadow appearance-none border border-gray-600 rounded-lg w-full py-3 px-3 text-white bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                     placeholder="James Kirwa"
//                                     required
//                                 />
//                             </div>
//                         </div>
//                     )}

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

//                     {!formState.isLogin && (
//                         <div className="mb-6">
//                             <label className="block text-sm font-medium text-gray-400 mb-2">Confirm Password</label>
//                             <div className="relative">
//                                 <FaLock className="absolute left-3 top-3 text-gray-500" />
//                                 <input
//                                     type={showConfirmPassword ? "text" : "password"}
//                                     name="confirmPassword"
//                                     value={formState.confirmPassword}
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
//                     )}

//                     {formState.isLogin && (
//                         <div className="flex items-center mb-6">
//                             <input
//                                 type="checkbox"
//                                 name="rememberMe"
//                                 checked={formState.rememberMe}
//                                 onChange={handleChange}
//                                 className="mr-2 leading-tight text-blue-500"
//                             />
//                             <label className="text-sm text-gray-400">Remember Me</label>
//                             <button
//                                 type="button"
//                                 onClick={handleForgotPassword}
//                                 className="ml-auto text-sm text-blue-400 hover:underline"
//                             >
//                                 Forgot Password?
//                             </button>
//                         </div>
//                     )}

//                     {error && <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>}

//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 flex items-center justify-center"
//                     >
//                         {loading ? <FaSpinner className="animate-spin mr-2" /> : null}
//                         {formState.isLogin ? "Login" : "Sign Up"}
//                     </button>

//                     <div className="flex items-center justify-between mt-6">
//                         <button
//                             type="button"
//                             onClick={toggleForm}
//                             className="text-blue-400 hover:underline text-sm"
//                         >
//                             {formState.isLogin ? "Need an account? Sign Up" : "Already have an account? Login"}
//                         </button>
//                     </div>

//                     <div className="mt-6 text-center">
//                         <p className="text-gray-500 text-sm">Or continue with</p>
//                         <button
//                             type="button"
//                             onClick={handleGoogleLogin}
//                             className="mt-2 flex items-center justify-center gap-2 w-full bg-slate-100 border border-gray-300 text-blue-700 font-bold py-2 px-4 rounded-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300"
//                         >
//                             <FaGoogle /> Google
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default LoginSignup;



import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaGoogle, FaSpinner } from "react-icons/fa";

const LoginSignup = () => {
    const [formState, setFormState] = useState({
        isLogin: true,
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        rememberMe: false,
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormState((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    }, []);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            setLoading(true);
            setError("");

            // Validate passwords match during signup
            if (!formState.isLogin && formState.password !== formState.confirmPassword) {
                setError("Passwords do not match");
                setLoading(false);
                return;
            }

            const { email, password, name, rememberMe } = formState;
            try {
                const apiEndpoint = formState.isLogin ? "/api/auth/login/" : "/api/auth/signup/";
                const response = await fetch(apiEndpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                        name: formState.isLogin ? undefined : name,
                        rememberMe,
                    }),
                });

                if (!response.ok) {
                    // Handle errors like 404 or 500
                    const errorText = await response.text(); // Read the response as plain text
                    throw new Error(`Error: ${response.status}, Response: ${errorText}`);
                }

                // Check if the response has a valid JSON body
                let data = {};
                try {
                    data = await response.json(); // Try to parse JSON response
                } catch (err) {
                    console.error("Error parsing JSON:", err);
                    // Handle unexpected response, e.g., empty response
                    setError("Unexpected response from server.");
                    return;
                }

                if (formState.isLogin) {
                    // Store tokens in localStorage for future use
                    localStorage.setItem('accessToken', data.access);
                    localStorage.setItem('refreshToken', data.refresh);
                    if (rememberMe) {
                        localStorage.setItem('rememberMe', 'true');
                    }
                }
                console.log(formState.isLogin ? "Logged in successfully" : "Signed up successfully");
                navigate("/dashboard", { replace: true });
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        },
        [formState, navigate]
    );

    const toggleForm = useCallback(() => {
        setFormState((prev) => ({
            ...prev,
            isLogin: !prev.isLogin,
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
            rememberMe: false,
        }));
        setError("");
    }, []);

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(!showPassword);
    }, [showPassword]);

    const toggleConfirmPasswordVisibility = useCallback(() => {
        setShowConfirmPassword(!showConfirmPassword);
    }, [showConfirmPassword]);

    const handleForgotPassword = useCallback(() => {
        navigate("/forgot-password");
    }, [navigate]);

    const handleGoogleLogin = useCallback(() => {
        console.log("Google Login clicked");
        // Implement Google OAuth logic here
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            navigate("/dashboard", { replace: true });
        }
        if (localStorage.getItem('rememberMe') === 'true') {
            setFormState(prev => ({ ...prev, rememberMe: true }));
        }
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-blue-900">
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md transform transition-all ease-in-out duration-500 hover:shadow-3xl hover:-translate-y-1">
                <h2 className="text-4xl font-extrabold text-center text-white mb-8">
                    {formState.isLogin ? "Login" : "Sign Up"}
                </h2>

                <form onSubmit={handleSubmit}>
                    {!formState.isLogin && (
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
                    )}

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

                    {!formState.isLogin && (
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
                    )}

                    {formState.isLogin && (
                        <div className="flex items-center mb-6">
                            <input
                                type="checkbox"
                                name="rememberMe"
                                checked={formState.rememberMe}
                                onChange={handleChange}
                                className="mr-2 leading-tight text-blue-500"
                            />
                            <label className="text-sm text-gray-400">Remember Me</label>
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="ml-auto text-sm text-blue-400 hover:underline"
                            >
                                Forgot Password?
                            </button>
                        </div>
                    )}

                    {error && <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        {loading ? <FaSpinner className="animate-spin" /> : formState.isLogin ? "Login" : "Sign Up"}
                    </button>
                </form>

                <div className="flex items-center my-4">
                    <span className="w-full border-t border-gray-600"></span>
                    <span className="px-4 text-sm text-gray-400">or</span>
                    <span className="w-full border-t border-gray-600"></span>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                >
                    <FaGoogle className="inline-block mr-2" />
                    Sign in with Google
                </button>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-400">
                        {formState.isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                        <button
                            type="button"
                            onClick={toggleForm}
                            className="text-blue-400 hover:underline"
                        >
                            {formState.isLogin ? "Sign up" : "Login"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginSignup;
