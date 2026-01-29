

// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaSpinner, FaGoogle, FaFacebook, FaTwitter, FaInstagram, FaTiktok } from "react-icons/fa";
// import { RiShieldCheckFill } from "react-icons/ri";
// import { motion, AnimatePresence } from "framer-motion";
// import { useNavigate } from "react-router-dom"; 
// import api from "../../api";
// import { useAuth } from "../../context/AuthContext";
// import zxcvbn from "zxcvbn";
// import signupImage1 from "../../assets/signupImage1.png";
// import signupImage2 from "../../assets/signupImage2.png";

// const Signup = () => {
//   const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [emailValidating, setEmailValidating] = useState(false);
//   const [emailAvailable, setEmailAvailable] = useState(null);
//   const [currentImage, setCurrentImage] = useState(0);
//   const navigate = useNavigate(); // Added for navigation
//   const { isAuthenticated } = useAuth();

//   const images = useMemo(() => [
//     { src: signupImage1, alt: "Creative illustration 1" },
//     { src: signupImage2, alt: "Creative illustration 2" }
//   ], []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentImage(prev => (prev + 1) % images.length);
//     }, 5000);
//     return () => clearInterval(interval);
//   }, [images.length]);

//   const validateEmail = useCallback(async (email) => {
//     if (!email) return;
//     setEmailValidating(true);
//     try {
//       await api.get(`/api/auth/check-email/?email=${encodeURIComponent(email)}`);
//       setEmailAvailable(true);
//     } catch {
//       setEmailAvailable(false);
//     } finally {
//       setEmailValidating(false);
//     }
//   }, []);

//   useEffect(() => {
//     const delay = setTimeout(() => {
//       if (form.email) validateEmail(form.email);
//     }, 500);
//     return () => clearTimeout(delay);
//   }, [form.email, validateEmail]);

//   const passwordStrength = useMemo(() => zxcvbn(form.password || ""), [form.password]);
//   const strengthPercent = (passwordStrength.score * 100) / 4;

//   const handleChange = useCallback(e => {
//     const { name, value } = e.target;
//     setForm(prev => ({ ...prev, [name]: value }));
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     setSuccess("");

//     if (form.password !== form.confirmPassword) {
//       setError("Passwords do not match");
//       setLoading(false);
//       return;
//     }

//     if (passwordStrength.score < 2) {
//       setError("Password too weak - please choose a stronger password");
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await api.post("/api/auth/users/", {
//         email: form.email,
//         password: form.password,
//         re_password: form.confirmPassword,
//         name: form.name,
//       });
      
//       setSuccess("Account created successfully! Please check your email to verify your account.");
//       setForm({ name: "", email: "", password: "", confirmPassword: "" });
//     } catch (err) {
//       setError(err.response?.data?.email?.[0] || "Signup failed. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLoginClick = useCallback(() => {
//     navigate("/login");
//   }, [navigate]);

//   return (
//     <div className="min-h-screen flex bg-gradient-to-br from-gray-900 to-gray-800"> {/* Darker background */}
//       <div className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden">
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={currentImage}
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.5 }} // Reduced transition time
//             className="absolute inset-0"
//           >
//             <img
//               src={images[currentImage].src}
//               alt={images[currentImage].alt}
//               className="w-full h-full object-cover object-center"
//               loading="lazy" // Added for performance
//             />
//           </motion.div>
//         </AnimatePresence>
        
//         <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/50 to-transparent" />
        
//         <div className="relative z-10 p-12 text-white max-w-lg">
//           <motion.h1 
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ delay: 0.2 }}
//             className="text-5xl font-bold mb-4 leading-tight"
//           >
//             Welcome to the Future
//           </motion.h1>
//           <motion.p 
//             initial={{ y: 20, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ delay: 0.4 }}
//             className="text-xl opacity-90 mb-8"
//           >
//             Join our innovative platform and unlock exclusive features
//           </motion.p>
          
//           <div className="flex space-x-4">
//             {[FaFacebook, FaTwitter, FaInstagram, FaTiktok].map((Icon, index) => (
//               <motion.a
//                 key={index}
//                 href="#"
//                 whileHover={{ y: -5, scale: 1.1 }}
//                 whileTap={{ scale: 0.9 }}
//                 className="bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm p-3 rounded-full transition-all duration-200"
//               >
//                 <Icon className="text-white text-xl" />
//               </motion.a>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
//         <motion.div 
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3, duration: 0.4 }} // Faster transition
//           className="w-full max-w-xl bg-gray-800/90 rounded-3xl shadow-2xl overflow-hidden border border-gray-700/50 backdrop-blur-md"
//         >
//           <div className="relative p-8 text-center bg-gradient-to-r from-gray-700/30 to-gray-600/30">
//             <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]"></div>
//             <RiShieldCheckFill className="relative z-10 text-gray-400 text-6xl mx-auto mb-4" />
//             <h2 className="relative z-10 text-3xl font-bold text-white mb-2">Create Your Account</h2>
//             <p className="relative z-10 text-gray-300">Become part of something extraordinary</p>
//           </div>
          
//           <div className="p-8">
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-gray-300">Full Name</label>
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
//                       <FaUser />
//                     </div>
//                     <input
//                       name="name"
//                       type="text"
//                       value={form.name}
//                       onChange={handleChange}
//                       placeholder="James Kirwa"
//                       required
//                       className="w-full pl-10 pr-4 py-3 bg-gray-900/70 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 transition-all duration-200"
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-gray-300">Email Address</label>
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
//                       <FaEnvelope />
//                     </div>
//                     <input
//                       name="email"
//                       type="email"
//                       value={form.email}
//                       onChange={handleChange}
//                       placeholder="example@email.com"
//                       required
//                       className="w-full pl-10 pr-10 py-3 bg-gray-900/70 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 transition-all duration-200"
//                     />
//                     <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
//                       {emailValidating ? (
//                         <FaSpinner className="animate-spin text-blue-500" />
//                       ) : emailAvailable !== null && (
//                         <span className={`text-sm ${emailAvailable ? "text-green-400" : "text-red-400"}`}>
//                           {emailAvailable ? "✓" : "✗"}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-gray-300">Password</label>
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
//                       <FaLock />
//                     </div>
//                     <input
//                       name="password"
//                       type={showPassword ? "text" : "password"}
//                       value={form.password}
//                       onChange={handleChange}
//                       placeholder="••••••••"
//                       required
//                       className="w-full pl-10 pr-10 py-3 bg-gray-900/70 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 transition-all duration-200"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
//                     >
//                       {showPassword ? <FaEyeSlash /> : <FaEye />}
//                     </button>
//                   </div>
                  
//                   {form.password && (
//                     <div className="mt-2">
//                       <div className="w-full bg-gray-900/50 rounded-full h-2 overflow-hidden">
//                         <div
//                           className={`h-full rounded-full transition-all duration-300 ${
//                             passwordStrength.score < 1 ? "bg-red-500" :
//                             passwordStrength.score < 2 ? "bg-orange-400" :
//                             passwordStrength.score < 3 ? "bg-yellow-400" :
//                             passwordStrength.score < 4 ? "bg-blue-400" : "bg-green-400"
//                           }`}
//                           style={{ width: `${strengthPercent}%` }}
//                         />
//                       </div>
//                       <div className="flex justify-between mt-1">
//                         <span className="text-xs text-gray-400">
//                           Strength: {["Weak", "Fair", "Good", "Strong", "Very Strong"][passwordStrength.score]}
//                         </span>
//                         <span className="text-xs text-gray-400">
//                           {form.password.length} characters
//                         </span>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-gray-300">Confirm Password</label>
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
//                       <FaLock />
//                     </div>
//                     <input
//                       name="confirmPassword"
//                       type={showConfirmPassword ? "text" : "password"}
//                       value={form.confirmPassword}
//                       onChange={handleChange}
//                       placeholder="••••••••"
//                       required
//                       className="w-full pl-10 pr-10 py-3 bg-gray-900/70 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 transition-all duration-200"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                       className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
//                     >
//                       {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex items-center my-4">
//                 <span className="flex-1 border-t border-gray-700" />
//                 <span className="px-4 text-sm text-gray-400">or continue with</span>
//                 <span className="flex-1 border-t border-gray-700" />
//               </div>

//               <motion.button
//                 type="button"
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-gray-900/50 border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800/70 transition-all duration-200"
//               >
//                 <FaGoogle className="text-red-400 text-xl" />
//                 <span className="font-medium">Google</span>
//               </motion.button>

//               {error && (
//                 <motion.div 
//                   initial={{ opacity: 0, y: -10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="p-3 bg-red-900/50 text-red-200 rounded-lg text-sm border border-red-800/50"
//                 >
//                   {error}
//                 </motion.div>
//               )}

//               {success && (
//                 <motion.div 
//                   initial={{ opacity: 0, y: -10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="p-3 bg-green-900/50 text-green-200 rounded-lg text-sm border border-green-800/50"
//                 >
//                   {success}
//                 </motion.div>
//               )}

//               <motion.button
//                 whileHover={{ scale: 1.01 }}
//                 whileTap={{ scale: 0.99 }}
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-lg shadow-lg transition-all duration-200"
//               >
//                 {loading ? (
//                   <span className="flex justify-center items-center">
//                     <FaSpinner className="animate-spin mr-2" />
//                     Creating Account...
//                   </span>
//                 ) : "Sign Up Now"}
//               </motion.button>
//             </form>

//             <div className="mt-6 text-center text-sm text-gray-400">
//               Already have an account?{" "}
//               <button
//                 onClick={handleLoginClick}
//                 className="text-white hover:text-blue-400 font-medium hover:underline"
//               >
//                 Log In Here
//               </button>
//             </div>

//             <div className="mt-8 pt-6 border-t border-gray-700/50">
//               <p className="text-xs text-gray-500 text-center">
//                 By signing up, you agree to our Terms of Service and Privacy Policy
//               </p>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default React.memo(Signup);










import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaSpinner, 
  FaGoogle, FaFacebook, FaTwitter, FaInstagram, FaTiktok,
  FaCheckCircle, FaExclamationTriangle, FaInfoCircle 
} from "react-icons/fa";
import { RiShieldCheckFill } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom"; 
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import zxcvbn from "zxcvbn";
import signupImage1 from "../../assets/signupImage1.png";
import signupImage2 from "../../assets/signupImage2.png";

const Signup = () => {
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    general: ""
  });
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailValidating, setEmailValidating] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [serverError, setServerError] = useState(null);
  const [validationStates, setValidationStates] = useState({
    email: false,
    password: false,
    confirmPassword: false
  });
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const images = useMemo(() => [
    { src: signupImage1, alt: "Creative illustration 1" },
    { src: signupImage2, alt: "Creative illustration 2" }
  ], []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const validateEmailFormat = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validateEmail = useCallback(async (email) => {
    if (!email) {
      setEmailAvailable(null);
      return;
    }
    
    if (!validateEmailFormat(email)) {
      setErrors(prev => ({
        ...prev,
        email: "Please enter a valid email address"
      }));
      setEmailAvailable(false);
      return;
    }
    
    setEmailValidating(true);
    setErrors(prev => ({ ...prev, email: "" }));
    
    try {
      const response = await api.get(`/api/auth/check-email/?email=${encodeURIComponent(email)}`);
      if (response.data.exists) {
        setErrors(prev => ({
          ...prev,
          email: "This email is already registered"
        }));
        setEmailAvailable(false);
      } else {
        setErrors(prev => ({ ...prev, email: "" }));
        setEmailAvailable(true);
      }
      setValidationStates(prev => ({ ...prev, email: true }));
    } catch (error) {
      console.error("Email validation error:", error);
      setEmailAvailable(null);
    } finally {
      setEmailValidating(false);
    }
  }, [validateEmailFormat]);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (form.email) {
        validateEmail(form.email);
      } else {
        setEmailAvailable(null);
        setErrors(prev => ({ ...prev, email: "" }));
      }
    }, 800);
    return () => clearTimeout(delay);
  }, [form.email, validateEmail]);

  const validatePassword = useCallback((password) => {
    const newErrors = {};
    
    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])/.test(password)) {
      newErrors.password = "Password must contain at least one lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(password)) {
      newErrors.password = "Password must contain at least one number";
    } else {
      newErrors.password = "";
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    setValidationStates(prev => ({ ...prev, password: !newErrors.password }));
  }, []);

  useEffect(() => {
    if (form.password) {
      validatePassword(form.password);
    } else {
      setErrors(prev => ({ ...prev, password: "" }));
      setValidationStates(prev => ({ ...prev, password: false }));
    }
  }, [form.password, validatePassword]);

  useEffect(() => {
    if (form.confirmPassword) {
      if (form.password !== form.confirmPassword) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: "Passwords do not match"
        }));
        setValidationStates(prev => ({ ...prev, confirmPassword: false }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: "" }));
        setValidationStates(prev => ({ ...prev, confirmPassword: true }));
      }
    } else {
      setErrors(prev => ({ ...prev, confirmPassword: "" }));
      setValidationStates(prev => ({ ...prev, confirmPassword: false }));
    }
  }, [form.password, form.confirmPassword]);

  const passwordStrength = useMemo(() => zxcvbn(form.password || ""), [form.password]);
  const strengthPercent = (passwordStrength.score * 100) / 4;

  const getStrengthColor = (score) => {
    if (score < 1) return "bg-red-500";
    if (score < 2) return "bg-orange-500";
    if (score < 3) return "bg-yellow-500";
    if (score < 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthText = (score) => {
    if (score < 1) return "Very Weak";
    if (score < 2) return "Weak";
    if (score < 3) return "Fair";
    if (score < 4) return "Strong";
    return "Very Strong";
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setServerError(null);
    setSuccess("");
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [errors]);

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!validateEmailFormat(form.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    } else if (emailAvailable === false) {
      newErrors.email = "This email is already registered";
      isValid = false;
    }

    if (!form.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (passwordStrength.score < 2) {
      newErrors.password = "Password is too weak. Please choose a stronger password.";
      isValid = false;
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({ name: "", email: "", password: "", confirmPassword: "", general: "" });
    setServerError(null);
    setSuccess("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/api/auth/users/", {
        email: form.email.trim(),
        password: form.password,
        re_password: form.confirmPassword,
        name: form.name.trim(),
      });
      
      setSuccess("Account created successfully! Please check your email to verify your account.");
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      
    } catch (err) {
      console.error("Signup error:", err);
      
      // Handle different types of errors
      if (err.response) {
        // Server responded with error status
        const { data, status } = err.response;
        
        if (status === 400) {
          // Bad Request - validation errors from server
          const fieldErrors = {};
          
          if (data.email) {
            fieldErrors.email = Array.isArray(data.email) ? data.email[0] : data.email;
          }
          if (data.password) {
            fieldErrors.password = Array.isArray(data.password) ? data.password[0] : data.password;
          }
          if (data.re_password) {
            fieldErrors.confirmPassword = Array.isArray(data.re_password) ? data.re_password[0] : data.re_password;
          }
          if (data.name) {
            fieldErrors.name = Array.isArray(data.name) ? data.name[0] : data.name;
          }
          
          // Handle non-field errors
          if (data.non_field_errors) {
            const nonFieldError = Array.isArray(data.non_field_errors) 
              ? data.non_field_errors[0] 
              : data.non_field_errors;
            fieldErrors.general = nonFieldError;
          }
          
          setErrors(prev => ({ ...prev, ...fieldErrors }));
          
        } else if (status === 409) {
          // Conflict - user already exists
          setErrors(prev => ({
            ...prev,
            email: "This email is already registered"
          }));
          
        } else if (status === 429) {
          // Rate limited
          setServerError("Too many attempts. Please try again later.");
          
        } else if (status >= 500) {
          // Server error
          setServerError("Server error. Please try again later.");
          
        } else {
          // Other client errors
          setServerError(data?.detail || "Registration failed. Please try again.");
        }
        
      } else if (err.request) {
        // Request was made but no response
        setServerError("Network error. Please check your connection and try again.");
        
      } else {
        // Other errors
        setServerError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  const isFormValid = () => {
    return (
      form.name.trim() &&
      form.email.trim() &&
      validateEmailFormat(form.email) &&
      emailAvailable === true &&
      form.password &&
      form.confirmPassword &&
      form.password === form.confirmPassword &&
      passwordStrength.score >= 2 &&
      !errors.name &&
      !errors.email &&
      !errors.password &&
      !errors.confirmPassword
    );
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <img
              src={images[currentImage].src}
              alt={images[currentImage].alt}
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
          </motion.div>
        </AnimatePresence>
        
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/50 to-transparent" />
        
        <div className="relative z-10 p-12 text-white max-w-lg">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold mb-4 leading-tight"
          >
            Join Our Community
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl opacity-90 mb-8"
          >
            Create your account and start your journey with us
          </motion.p>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <FaCheckCircle className="text-green-400 mr-3" />
              <span>Secure and encrypted</span>
            </div>
            <div className="flex items-center">
              <FaCheckCircle className="text-green-400 mr-3" />
              <span>No hidden fees</span>
            </div>
            <div className="flex items-center">
              <FaCheckCircle className="text-green-400 mr-3" />
              <span>24/7 customer support</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="w-full max-w-xl bg-gray-800/90 rounded-3xl shadow-2xl overflow-hidden border border-gray-700/50 backdrop-blur-md"
        >
          <div className="relative p-8 text-center bg-gradient-to-r from-gray-700/30 to-gray-600/30">
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]"></div>
            <RiShieldCheckFill className="relative z-10 text-gray-400 text-6xl mx-auto mb-4" />
            <h2 className="relative z-10 text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="relative z-10 text-gray-300">Fill in your details to get started</p>
          </div>
          
          <div className="p-6 sm:p-8">
            {serverError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-900/30 text-red-200 rounded-lg border border-red-800/50"
              >
                <div className="flex items-start">
                  <FaExclamationTriangle className="mt-0.5 mr-3 flex-shrink-0" />
                  <span>{serverError}</span>
                </div>
              </motion.div>
            )}
            
            {errors.general && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-yellow-900/30 text-yellow-200 rounded-lg border border-yellow-800/50"
              >
                <div className="flex items-start">
                  <FaExclamationTriangle className="mt-0.5 mr-3 flex-shrink-0" />
                  <span>{errors.general}</span>
                </div>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-900/30 text-green-200 rounded-lg border border-green-800/50"
              >
                <div className="flex items-start">
                  <FaCheckCircle className="mt-0.5 mr-3 flex-shrink-0" />
                  <span>{success}</span>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex justify-between">
                    <span>Full Name</span>
                    {errors.name && (
                      <span className="text-red-400 text-xs font-normal">
                        <FaExclamationTriangle className="inline mr-1" />
                        {errors.name}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FaUser />
                    </div>
                    <input
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="James Kirwa"
                      required
                      className={`w-full pl-10 pr-4 py-3 bg-gray-900/70 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 transition-all duration-200 ${
                        errors.name ? "border-red-500" : "border-gray-700"
                      }`}
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex justify-between">
                    <span>Email Address</span>
                    {errors.email && (
                      <span className="text-red-400 text-xs font-normal">
                        <FaExclamationTriangle className="inline mr-1" />
                        {errors.email}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FaEnvelope />
                    </div>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="example@email.com"
                      required
                      className={`w-full pl-10 pr-10 py-3 bg-gray-900/70 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 transition-all duration-200 ${
                        errors.email ? "border-red-500" : "border-gray-700"
                      }`}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {emailValidating ? (
                        <FaSpinner className="animate-spin text-blue-500" />
                      ) : emailAvailable !== null && (
                        <span className={`${emailAvailable ? "text-green-400" : "text-red-400"}`}>
                          {emailAvailable ? "✓" : "✗"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex justify-between">
                    <span>Password</span>
                    {errors.password && (
                      <span className="text-red-400 text-xs font-normal">
                        <FaExclamationTriangle className="inline mr-1" />
                        {errors.password}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FaLock />
                    </div>
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className={`w-full pl-10 pr-10 py-3 bg-gray-900/70 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 transition-all duration-200 ${
                        errors.password ? "border-red-500" : "border-gray-700"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  
                  {form.password && (
                    <div className="mt-2 space-y-2">
                      <div className="w-full bg-gray-900/50 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full transition-all duration-500 ${getStrengthColor(passwordStrength.score)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${strengthPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">
                          Strength: <span className={`font-semibold ${getStrengthColor(passwordStrength.score).replace('bg-', 'text-')}`}>
                            {getStrengthText(passwordStrength.score)}
                          </span>
                        </span>
                        <span className="text-xs text-gray-400">
                          {form.password.length} characters
                        </span>
                      </div>
                      
                      {/* Password Requirements */}
                      <div className="space-y-1 mt-3">
                        <div className="flex items-center text-xs">
                          <span className={`mr-2 ${form.password.length >= 8 ? 'text-green-400' : 'text-gray-500'}`}>
                            {form.password.length >= 8 ? '✓' : '○'}
                          </span>
                          <span className={form.password.length >= 8 ? 'text-gray-300' : 'text-gray-500'}>
                            At least 8 characters
                          </span>
                        </div>
                        <div className="flex items-center text-xs">
                          <span className={`mr-2 ${/(?=.*[a-z])/.test(form.password) ? 'text-green-400' : 'text-gray-500'}`}>
                            {/(?=.*[a-z])/.test(form.password) ? '✓' : '○'}
                          </span>
                          <span className={/(?=.*[a-z])/.test(form.password) ? 'text-gray-300' : 'text-gray-500'}>
                            One lowercase letter
                          </span>
                        </div>
                        <div className="flex items-center text-xs">
                          <span className={`mr-2 ${/(?=.*[A-Z])/.test(form.password) ? 'text-green-400' : 'text-gray-500'}`}>
                            {/(?=.*[A-Z])/.test(form.password) ? '✓' : '○'}
                          </span>
                          <span className={/(?=.*[A-Z])/.test(form.password) ? 'text-gray-300' : 'text-gray-500'}>
                            One uppercase letter
                          </span>
                        </div>
                        <div className="flex items-center text-xs">
                          <span className={`mr-2 ${/(?=.*\d)/.test(form.password) ? 'text-green-400' : 'text-gray-500'}`}>
                            {/(?=.*\d)/.test(form.password) ? '✓' : '○'}
                          </span>
                          <span className={/(?=.*\d)/.test(form.password) ? 'text-gray-300' : 'text-gray-500'}>
                            One number
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300 flex justify-between">
                    <span>Confirm Password</span>
                    {errors.confirmPassword && (
                      <span className="text-red-400 text-xs font-normal">
                        <FaExclamationTriangle className="inline mr-1" />
                        {errors.confirmPassword}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <FaLock />
                    </div>
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className={`w-full pl-10 pr-10 py-3 bg-gray-900/70 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 transition-all duration-200 ${
                        errors.confirmPassword ? "border-red-500" : "border-gray-700"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading || !isFormValid()}
                whileHover={{ scale: !loading && isFormValid() ? 1.02 : 1 }}
                whileTap={{ scale: !loading && isFormValid() ? 0.98 : 1 }}
                className={`w-full font-bold py-4 rounded-lg shadow-lg transition-all duration-200 ${
                  loading || !isFormValid()
                    ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                }`}
              >
                {loading ? (
                  <span className="flex justify-center items-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Creating Account...
                  </span>
                ) : "Sign Up Now"}
              </motion.button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-white hover:text-blue-400 font-medium hover:underline transition-colors"
              >
                Log In Here
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700/50">
              <p className="text-xs text-gray-500 text-center">
                By signing up, you agree to our{" "}
                <Link to="/terms" className="text-blue-400 hover:text-blue-300 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-blue-400 hover:text-blue-300 hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default React.memo(Signup);