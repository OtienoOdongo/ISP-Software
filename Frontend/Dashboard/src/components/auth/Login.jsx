



// import React, { useState, useCallback, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaSpinner } from "react-icons/fa";
// import api from "../../../api";
// import { useAuth } from "../../context/AuthContext";

// const Login = () => {
//     const [formState, setFormState] = useState({
//         email: "",
//         password: "",
//         rememberMe: false,
//     });
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [showPassword, setShowPassword] = useState(false);
//     const navigate = useNavigate();
//     const { login, isAuthenticated } = useAuth();

//     const handleChange = useCallback((e) => {
//         const { name, value, type, checked } = e.target;
//         setFormState((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
//     }, []);

//     const handleSubmit = useCallback(
//         async (e) => {
//             e.preventDefault();
//             setLoading(true);
//             setError("");

//             try {
//                 const response = await api.post("/api/auth/jwt/create/", {
//                     email: formState.email,
//                     password: formState.password,
//                 });
//                 login(response.data.access, response.data.refresh);
//                 if (formState.rememberMe) {
//                     localStorage.setItem("rememberMe", "true");
//                 }
//                 navigate("/dashboard", { replace: true });
//             } catch (error) {
//                 setError(error.response?.data?.detail || "Login failed.");
//             } finally {
//                 setLoading(false);
//             }
//         },
//         [formState, navigate, login]
//     );

//     const togglePasswordVisibility = useCallback(() => {
//         setShowPassword(!showPassword);
//     }, [showPassword]);

//     const handleForgotPassword = useCallback(() => {
//         navigate("/forgot-password");
//     }, [navigate]);

//     const handleGoogleLogin = useCallback(() => {
//         console.log("Google Login clicked - Implement OAuth if needed");
//     }, []);

//     useEffect(() => {
//         if (isAuthenticated) {
//             navigate("/dashboard", { replace: true });
//         }
//         if (localStorage.getItem("rememberMe") === "true") {
//             setFormState((prev) => ({ ...prev, rememberMe: true }));
//         }
//     }, [isAuthenticated, navigate]);

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-blue-900">
//             <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md transform transition-all ease-in-out duration-500 hover:shadow-3xl hover:-translate-y-1">
//                 <h2 className="text-4xl font-extrabold text-center text-white mb-8">Login</h2>
//                 <form onSubmit={handleSubmit}>
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

//                     <div className="flex items-center mb-6">
//                         <input
//                             type="checkbox"
//                             name="rememberMe"
//                             checked={formState.rememberMe}
//                             onChange={handleChange}
//                             className="mr-2 leading-tight text-blue-500"
//                         />
//                         <label className="text-sm text-gray-400">Remember Me</label>
//                         <button
//                             type="button"
//                             onClick={handleForgotPassword}
//                             className="ml-auto text-sm text-blue-400 hover:underline"
//                         >
//                             Forgot Password?
//                         </button>
//                     </div>

//                     {error && <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>}

//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
//                     >
//                         {loading ? <FaSpinner className="animate-spin" /> : "Login"}
//                     </button>
//                 </form>

//                 <div className="flex items-center my-4">
//                     <span className="w-full border-t border-gray-600"></span>
//                     <span className="px-4 text-sm text-gray-400">or</span>
//                     <span className="w-full border-t border-gray-600"></span>
//                 </div>

//                 <button
//                     onClick={handleGoogleLogin}
//                     className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
//                 >
//                     <FaGoogle className="inline-block mr-2" />
//                     Sign in with Google
//                 </button>

//                 <div className="mt-6 text-center">
//                     <p className="text-sm text-gray-400">
//                         Don't have an account?{" "}
//                         <button
//                             type="button"
//                             onClick={() => navigate("/signup")}
//                             className="text-blue-400 hover:underline"
//                         >
//                             Sign up
//                         </button>
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Login;



import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaSpinner } from "react-icons/fa";
import api from "../../../api";
import { useAuth } from "../../context/AuthContext";
import { ACCESS_TOKEN } from "../../constants/index";

const Login = () => {
  const [formState, setFormState] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormState((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setError("");

      try {
        // Step 1: Get JWT tokens
        console.log("Attempting login with:", formState.email, formState.password);
        const tokenResponse = await api.post("/api/auth/jwt/create/", {
          email: formState.email,
          password: formState.password,
        });
        console.log("Token response:", tokenResponse.data);

        const accessToken = tokenResponse.data.access;
        const refreshToken = tokenResponse.data.refresh;

        // Step 2: Store tokens (access in localStorage for interceptor, refresh optionally)
        localStorage.setItem(ACCESS_TOKEN, accessToken);
        if (formState.rememberMe) {
          localStorage.setItem("refreshToken", refreshToken); // Optional: store refresh token
        }

        // Step 3: Fetch user details with the new access token
        const userResponse = await api.get("/api/auth/users/me/", {
          headers: { Authorization: `Bearer ${accessToken}` }, // Explicitly pass token
        });
        console.log("User data:", userResponse.data);
        console.log("User request headers:", userResponse.config.headers);

        // Step 4: Extract permissions (adjust based on your backend response)
        const permissions = userResponse.data.permissions || [];

        // Step 5: Update auth context with tokens and permissions
        login(accessToken, refreshToken, permissions);

        // Step 6: Navigate to dashboard
        navigate("/dashboard", { replace: true });
      } catch (error) {
        const errorDetail = error.response?.data?.detail || "Login failed. Please check your credentials.";
        console.error("Login error:", error.response?.status, errorDetail);
        setError(errorDetail);
      } finally {
        setLoading(false);
      }
    },
    [formState, navigate, login]
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleForgotPassword = useCallback(() => {
    navigate("/forgot-password");
  }, [navigate]);

  const handleGoogleLogin = useCallback(() => {
    console.log("Google Login clicked - Implement OAuth if needed");
    // Add Google OAuth logic here if needed
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
    if (localStorage.getItem("rememberMe") === "true") {
      setFormState((prev) => ({ ...prev, rememberMe: true }));
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-blue-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md transform transition-all ease-in-out duration-500 hover:shadow-3xl hover:-translate-y-1">
        <h2 className="text-4xl font-extrabold text-center text-white mb-8">Login</h2>
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

          {error && <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {loading ? <FaSpinner className="animate-spin mx-auto" /> : "Login"}
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
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-blue-400 hover:underline"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;