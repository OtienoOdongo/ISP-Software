
// import React, { useState, useCallback, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaSpinner } from "react-icons/fa";
// import api from "../../api"
// import { useAuth } from "../../context/AuthContext";
// import { ACCESS_TOKEN } from "../../constants/index";

// const Login = () => {
//   const [formState, setFormState] = useState({
//     email: "",
//     password: "",
//     rememberMe: false,
//   });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const navigate = useNavigate();
//   const { login, isAuthenticated } = useAuth();

//   const handleChange = useCallback((e) => {
//     const { name, value, type, checked } = e.target;
//     setFormState((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
//   }, []);

//   const handleSubmit = useCallback(
//     async (e) => {
//       e.preventDefault();
//       setLoading(true);
//       setError("");

//       try {
//         // Step 1: Get JWT tokens
//         console.log("Attempting login with:", formState.email, formState.password);
//         const tokenResponse = await api.post("/api/auth/jwt/create/", {
//           email: formState.email,
//           password: formState.password,
//         });
//         console.log("Token response:", tokenResponse.data);

//         const accessToken = tokenResponse.data.access;
//         const refreshToken = tokenResponse.data.refresh;

//         // Step 2: Store tokens (access in localStorage for interceptor, refresh optionally)
//         localStorage.setItem(ACCESS_TOKEN, accessToken);
//         if (formState.rememberMe) {
//           localStorage.setItem("refreshToken", refreshToken); // Optional: store refresh token
//         }

//         // Step 3: Fetch user details with the new access token
//         const userResponse = await api.get("/api/auth/users/me/", {
//           headers: { Authorization: `Bearer ${accessToken}` }, // Explicitly pass token
//         });
//         console.log("User data:", userResponse.data);
//         console.log("User request headers:", userResponse.config.headers);

//         // Step 4: Extract permissions (adjust based on your backend response)
//         const permissions = userResponse.data.permissions || [];

//         // Step 5: Update auth context with tokens and permissions
//         login(accessToken, refreshToken, permissions);

//         // Step 6: Navigate to dashboard
//         navigate("/dashboard", { replace: true });
//       } catch (error) {
//         const errorDetail = error.response?.data?.detail || "Login failed. Please check your credentials.";
//         console.error("Login error:", error.response?.status, errorDetail);
//         setError(errorDetail);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [formState, navigate, login]
//   );

//   const togglePasswordVisibility = useCallback(() => {
//     setShowPassword((prev) => !prev);
//   }, []);

//   const handleForgotPassword = useCallback(() => {
//     navigate("/forgot-password");
//   }, [navigate]);

//   const handleGoogleLogin = useCallback(() => {
//     console.log("Google Login clicked - Implement OAuth if needed");
//     // Add Google OAuth logic here if needed
//   }, []);

//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate("/dashboard", { replace: true });
//     }
//     if (localStorage.getItem("rememberMe") === "true") {
//       setFormState((prev) => ({ ...prev, rememberMe: true }));
//     }
//   }, [isAuthenticated, navigate]);

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-blue-900">
//       <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md transform transition-all ease-in-out duration-500 hover:shadow-3xl hover:-translate-y-1">
//         <h2 className="text-4xl font-extrabold text-center text-white mb-8">Login</h2>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-6">
//             <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
//             <div className="relative">
//               <FaEnvelope className="absolute left-3 top-3 text-gray-500" />
//               <input
//                 type="email"
//                 name="email"
//                 value={formState.email}
//                 onChange={handleChange}
//                 className="pl-10 pr-4 shadow appearance-none border border-gray-600 rounded-lg w-full py-3 px-3 text-white bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="example@mail.com"
//                 required
//               />
//             </div>
//           </div>

//           <div className="mb-6">
//             <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
//             <div className="relative">
//               <FaLock className="absolute left-3 top-3 text-gray-500" />
//               <input
//                 type={showPassword ? "text" : "password"}
//                 name="password"
//                 value={formState.password}
//                 onChange={handleChange}
//                 className="pl-10 pr-10 shadow appearance-none border border-gray-600 rounded-lg w-full py-3 px-3 text-white bg-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="**********"
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={togglePasswordVisibility}
//                 className="absolute right-3 top-3 text-gray-500 hover:text-gray-300"
//               >
//                 {showPassword ? <FaEyeSlash /> : <FaEye />}
//               </button>
//             </div>
//           </div>

//           <div className="flex items-center mb-6">
//             <input
//               type="checkbox"
//               name="rememberMe"
//               checked={formState.rememberMe}
//               onChange={handleChange}
//               className="mr-2 leading-tight text-blue-500"
//             />
//             <label className="text-sm text-gray-400">Remember Me</label>
//             <button
//               type="button"
//               onClick={handleForgotPassword}
//               className="ml-auto text-sm text-blue-400 hover:underline"
//             >
//               Forgot Password?
//             </button>
//           </div>

//           {error && <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
//           >
//             {loading ? <FaSpinner className="animate-spin mx-auto" /> : "Login"}
//           </button>
//         </form>

//         <div className="flex items-center my-4">
//           <span className="w-full border-t border-gray-600"></span>
//           <span className="px-4 text-sm text-gray-400">or</span>
//           <span className="w-full border-t border-gray-600"></span>
//         </div>

//         <button
//           onClick={handleGoogleLogin}
//           className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
//         >
//           <FaGoogle className="inline-block mr-2" />
//           Sign in with Google
//         </button>

//         <div className="mt-6 text-center">
//           <p className="text-sm text-gray-400">
//             Don't have an account?{" "}
//             <button
//               type="button"
//               onClick={() => navigate("/signup")}
//               className="text-blue-400 hover:underline"
//             >
//               Sign up
//             </button>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;




import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaGithub, FaSpinner } from "react-icons/fa";
import { RiShieldUserLine } from "react-icons/ri";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants";

const Login = () => {
  const [formState, setFormState] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const rateLimitTimer = useRef(null);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Client-side rate limiting
  useEffect(() => {
    if (loginAttempts >= 3) {
      setIsRateLimited(true);
      rateLimitTimer.current = setTimeout(() => {
        setIsRateLimited(false);
        setLoginAttempts(0);
      }, 30000); // 30 seconds cooldown
    }
    return () => clearTimeout(rateLimitTimer.current);
  }, [loginAttempts]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormState((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (isRateLimited) {
        setError("Too many attempts. Please wait 30 seconds.");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const tokenResponse = await api.post("/api/auth/jwt/create/", {
          email: formState.email,
          password: formState.password,
        });

        const { access, refresh } = tokenResponse.data;

        // Store tokens with expiration
        localStorage.setItem(ACCESS_TOKEN, access);
        if (formState.rememberMe) {
          localStorage.setItem(REFRESH_TOKEN, refresh);
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem(REFRESH_TOKEN);
          localStorage.removeItem("rememberMe");
        }

        const userResponse = await api.get("/api/auth/users/me/");
        const permissions = userResponse.data.permissions || [];

        login(access, refresh, permissions);
        navigate("/dashboard", { replace: true });
      } catch (error) {
        setLoginAttempts(prev => prev + 1);
        const errorDetail = error.response?.data?.detail || 
          "Login failed. Please check your credentials.";
        setError(errorDetail);
      } finally {
        setLoading(false);
      }
    },
    [formState, navigate, login, isRateLimited]
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleForgotPassword = useCallback(() => {
    navigate("/forgot-password");
  }, [navigate]);

  const handleGoogleLogin = useCallback(() => {
    window.location.href = `${api.defaults.baseURL}/api/auth/o/google-oauth2/?redirect_uri=${window.location.origin}/oauth/complete/google-oauth2/`;
  }, []);

  const handleGithubLogin = useCallback(() => {
    window.location.href = `${api.defaults.baseURL}/api/auth/o/github/?redirect_uri=${window.location.origin}/oauth/complete/github/`;
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900 p-4">
      <div className="bg-gray-800 bg-opacity-90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 transform transition-all duration-300 hover:shadow-3xl hover:-translate-y-1">
        <div className="flex justify-center mb-6">
          <RiShieldUserLine className="text-blue-500 text-5xl" />
        </div>
        <h2 className="text-3xl font-bold text-center text-white mb-2">Welcome Back</h2>
        <p className="text-center text-gray-400 mb-8">Login to access your account</p>

        <div className="flex gap-4 mb-6">
          <button 
            onClick={handleGoogleLogin}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-2.5 px-4 rounded-lg font-medium transition-colors"
          >
            <FaGoogle className="text-red-500" />
            Google
          </button>
          <button 
            onClick={handleGithubLogin}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-2.5 px-4 rounded-lg font-medium transition-colors"
          >
            <FaGithub />
            GitHub
          </button>
        </div>

        <div className="flex items-center my-4">
          <span className="flex-1 border-t border-gray-700"></span>
          <span className="px-4 text-sm text-gray-500">or with email</span>
          <span className="flex-1 border-t border-gray-700"></span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-500" />
              </div>
              <input
                type="email"
                name="email"
                value={formState.email}
                onChange={handleChange}
                className="pl-10 pr-4 w-full py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="example@mail.com"
                required
                disabled={isRateLimited}
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-500" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formState.password}
                onChange={handleChange}
                className="pl-10 pr-10 w-full py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="**********"
                required
                disabled={isRateLimited}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formState.rememberMe}
                onChange={handleChange}
                className="rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-400">Remember me</span>
            </label>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              isRateLimited ? 'bg-red-900 bg-opacity-30 text-red-300' : 'bg-red-900 bg-opacity-30 text-red-300'
            }`}>
              {error}
              {isRateLimited && (
                <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-red-500 h-1.5 rounded-full" 
                    style={{ width: `${100 - (loginAttempts * 33.33)}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || isRateLimited}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-3.5 px-4 rounded-lg font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-300 disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <FaSpinner className="animate-spin mr-2" />
                Signing In...
              </span>
            ) : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Login);