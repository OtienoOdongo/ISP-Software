





import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { RiShieldUserLine } from "react-icons/ri";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants";


import loginImage1 from "../../assets/loginImage1.png";
import loginImage2 from "../../assets/loginImage2.png";
import loginImage3 from "../../assets/loginImage3.png";
import loginImage4 from "../../assets/loginImage4.png";

const Login = () => {
  const [formState, setFormState] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const rateLimitTimer = useRef(null);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const images = useMemo(() => [
    { src: loginImage1, alt: "Login background 1" },
    { src: loginImage2, alt: "Login background 2" },
    { src: loginImage3, alt: "Login background 3" },
    { src: loginImage4, alt: "Login background 4" },
  ], []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    if (loginAttempts >= 3) {
      setIsRateLimited(true);
      rateLimitTimer.current = setTimeout(() => {
        setIsRateLimited(false);
        setLoginAttempts(0);
      }, 30000);
    }
    return () => clearTimeout(rateLimitTimer.current);
  }, [loginAttempts]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
    if (localStorage.getItem("rememberMe") === "true") {
      setFormState(prev => ({ ...prev, rememberMe: true }));
    }
  }, [isAuthenticated, navigate]);

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
      setSuccess("");

      try {
        const tokenResponse = await api.post("/api/auth/jwt/create/", {
          email: formState.email,
          password: formState.password,
        });

        const { access, refresh } = tokenResponse.data;

        localStorage.setItem(ACCESS_TOKEN, access);
        if (formState.rememberMe) {
          localStorage.setItem(REFRESH_TOKEN, refresh);
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem(REFRESH_TOKEN);
          localStorage.removeItem("rememberMe");
        }

        const userResponse = await api.get("/api/auth/users/me/", {
          headers: { Authorization: `Bearer ${access}` },
        });
        const permissions = userResponse.data.permissions || [];

        login(access, refresh, permissions);
        setSuccess("Login successful! Welcome back.");
        navigate("/dashboard", { replace: true }); // Redirect to dashboard
      } catch (error) {
        setLoginAttempts(prev => prev + 1);
        setError(error.response?.data?.detail || "Login failed. Please check your credentials.");
      } finally {
        setLoading(false);
      }
    },
    [formState, login, isRateLimited, navigate]
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleSignupClick = useCallback(() => {
    navigate("/signup");
  }, [navigate]);

  const handleForgotPassword = useCallback(() => {
    navigate("/forgot-password");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="absolute inset-0 z-0">
        {images.map((image, index) => (
          <motion.img
            key={index}
            src={image.src}
            alt={image.alt}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${currentImage === index ? 'opacity-100' : 'opacity-0'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: currentImage === index ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            loading="lazy"
            onError={() => setError("Failed to load image")} // Error handling for images
          />
        ))}
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-gray-800/90 rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50 backdrop-blur-md">
          <div className="p-8 text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-700/30 to-gray-600/30" />
            <RiShieldUserLine className="relative z-10 text-gray-400 text-5xl mx-auto mb-4" />
            <h2 className="relative z-10 text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="relative z-10 text-gray-300">Sign in to your account</p>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FaEnvelope />
                  </div>
                  <input
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    required
                    disabled={isRateLimited}
                    className="w-full pl-10 pr-4 py-3 bg-gray-900/70 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 transition-all duration-200 disabled:opacity-70"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FaLock />
                  </div>
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formState.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    disabled={isRateLimited}
                    className="w-full pl-10 pr-10 py-3 bg-gray-900/70 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 transition-all duration-200 disabled:opacity-70"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    disabled={isRateLimited}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white disabled:opacity-70"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formState.rememberMe}
                    onChange={handleChange}
                    disabled={isRateLimited}
                    className="rounded bg-gray-900/50 border-gray-700 text-blue-500 focus:ring-blue-500 disabled:opacity-70"
                  />
                  <span className="text-sm text-gray-400">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-gray-400 hover:text-blue-400 font-medium transition-colors duration-200"
                >
                  Forgot password?
                </button>
              </div>

              {isRateLimited && (
                <div className="mt-2 w-full bg-gray-900/50 rounded-full h-1.5 overflow-hidden">
                  <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 30, ease: "linear" }}
                    className="bg-red-400 h-1.5 rounded-full"
                  />
                </div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-900/50 text-red-200 rounded-lg text-sm border border-red-800/50"
                >
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-green-900/50 text-green-200 rounded-lg text-sm border border-green-800/50"
                >
                  {success}
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || isRateLimited}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-lg shadow-lg transition-all duration-200 disabled:opacity-70"
              >
                {loading ? (
                  <span className="flex justify-center items-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Signing In...
                  </span>
                ) : "Login Now"}
              </motion.button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <button
                onClick={handleSignupClick}
                className="text-white hover:text-blue-400 font-medium hover:underline"
              >
                Sign Up Here
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default React.memo(Login);