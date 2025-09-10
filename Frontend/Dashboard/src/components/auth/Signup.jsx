
// import React, { useState, useCallback, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaSpinner, FaGoogle, FaGithub } from "react-icons/fa";
// import { RiShieldCheckFill } from "react-icons/ri";
// import api from "../../api";
// import { useAuth } from "../../context/AuthContext";
// import zxcvbn from "zxcvbn";

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
//     const [emailValidating, setEmailValidating] = useState(false);
//     const [emailAvailable, setEmailAvailable] = useState(null);
//     const navigate = useNavigate();
//     const { isAuthenticated } = useAuth();

//     // Password strength calculation
//     const passwordStrength = zxcvbn(formState.password || '');
//     const strengthPercentage = (passwordStrength.score * 100) / 4;

//     // Debounced email validation
//     const validateEmail = useCallback(async (email) => {
//         if (!email) return;
//         setEmailValidating(true);
//         try {
//             await api.get(`/api/auth/check-email/?email=${encodeURIComponent(email)}`);
//             setEmailAvailable(true);
//         } catch (error) {
//             setEmailAvailable(false);
//         } finally {
//             setEmailValidating(false);
//         }
//     }, []);

//     // Debounce implementation
//     useEffect(() => {
//         const timer = setTimeout(() => {
//             if (formState.email) validateEmail(formState.email);
//         }, 500);
//         return () => clearTimeout(timer);
//     }, [formState.email, validateEmail]);

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

//             if (passwordStrength.score < 2) {
//                 setError("Password is too weak. Please choose a stronger password.");
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
//                 navigate("/verify-email", { replace: true, state: { email: formState.email } });
//             } catch (error) {
//                 setError(error.response?.data?.email?.[0] || "Signup failed.");
//             } finally {
//                 setLoading(false);
//             }
//         },
//         [formState, navigate, passwordStrength.score]
//     );

//     const togglePasswordVisibility = useCallback(() => {
//         setShowPassword(!showPassword);
//     }, [showPassword]);

//     const toggleConfirmPasswordVisibility = useCallback(() => {
//         setShowConfirmPassword(!showConfirmPassword);
//     }, [showConfirmPassword]);

//     useEffect(() => {
//         if (isAuthenticated) {
//             navigate("/dashboard", { replace: true });
//         }
//     }, [isAuthenticated, navigate]);

//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-blue-900 p-4">
//             <div className="bg-gray-800 bg-opacity-90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700 transform transition-all duration-300 hover:shadow-3xl hover:-translate-y-1">
//                 <div className="flex justify-center mb-6">
//                     <RiShieldCheckFill className="text-blue-500 text-5xl" />
//                 </div>
//                 <h2 className="text-3xl font-bold text-center text-white mb-2">Create Account</h2>
//                 <p className="text-center text-gray-400 mb-8">Join us to get started</p>
                
//                 <div className="flex gap-4 mb-6">
//                     <button className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-2.5 px-4 rounded-lg font-medium transition-colors">
//                         <FaGoogle className="text-red-500" />
//                         Google
//                     </button>
//                     <button className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-2.5 px-4 rounded-lg font-medium transition-colors">
//                         <FaGithub />
//                         GitHub
//                     </button>
//                 </div>
                
//                 <div className="flex items-center my-4">
//                     <span className="flex-1 border-t border-gray-700"></span>
//                     <span className="px-4 text-sm text-gray-500">or continue with</span>
//                     <span className="flex-1 border-t border-gray-700"></span>
//                 </div>

//                 <form onSubmit={handleSubmit}>
//                     <div className="mb-5">
//                         <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
//                         <div className="relative">
//                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                 <FaUser className="text-gray-500" />
//                             </div>
//                             <input
//                                 type="text"
//                                 name="name"
//                                 value={formState.name}
//                                 onChange={handleChange}
//                                 className="pl-10 pr-4 w-full py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                                 placeholder="James Kirwa"
//                                 required
//                             />
//                         </div>
//                     </div>

//                     <div className="mb-5">
//                         <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
//                         <div className="relative">
//                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                 <FaEnvelope className="text-gray-500" />
//                             </div>
//                             <input
//                                 type="email"
//                                 name="email"
//                                 value={formState.email}
//                                 onChange={handleChange}
//                                 className="pl-10 pr-4 w-full py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                                 placeholder="example@mail.com"
//                                 required
//                             />
//                             {emailValidating ? (
//                                 <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
//                                     <FaSpinner className="animate-spin text-gray-400" />
//                                 </div>
//                             ) : emailAvailable !== null && (
//                                 <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
//                                     {emailAvailable ? (
//                                         <span className="text-green-500 text-sm">✓</span>
//                                     ) : (
//                                         <span className="text-red-500 text-sm">✗</span>
//                                     )}
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     <div className="mb-5">
//                         <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
//                         <div className="relative">
//                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                 <FaLock className="text-gray-500" />
//                             </div>
//                             <input
//                                 type={showPassword ? "text" : "password"}
//                                 name="password"
//                                 value={formState.password}
//                                 onChange={handleChange}
//                                 className="pl-10 pr-10 w-full py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                                 placeholder="**********"
//                                 required
//                             />
//                             <button
//                                 type="button"
//                                 onClick={togglePasswordVisibility}
//                                 className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
//                             >
//                                 {showPassword ? <FaEyeSlash /> : <FaEye />}
//                             </button>
//                         </div>
//                         {formState.password && (
//                             <div className="mt-2">
//                                 <div className="w-full bg-gray-700 rounded-full h-2">
//                                     <div 
//                                         className={`h-2 rounded-full ${
//                                             passwordStrength.score === 0 ? 'bg-red-500' :
//                                             passwordStrength.score === 1 ? 'bg-orange-500' :
//                                             passwordStrength.score === 2 ? 'bg-yellow-500' :
//                                             passwordStrength.score === 3 ? 'bg-blue-400' :
//                                             'bg-green-500'
//                                         }`}
//                                         style={{ width: `${strengthPercentage}%` }}
//                                     ></div>
//                                 </div>
//                                 <p className="text-xs mt-1 text-gray-400">
//                                     Password strength: {['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][passwordStrength.score]}
//                                 </p>
//                             </div>
//                         )}
//                     </div>

//                     <div className="mb-6">
//                         <label className="block text-sm font-medium text-gray-400 mb-2">Confirm Password</label>
//                         <div className="relative">
//                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                 <FaLock className="text-gray-500" />
//                             </div>
//                             <input
//                                 type={showConfirmPassword ? "text" : "password"}
//                                 name="confirmPassword"
//                                 value={formState.confirmPassword}
//                                 onChange={handleChange}
//                                 className="pl-10 pr-10 w-full py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                                 placeholder="**********"
//                                 required
//                             />
//                             <button
//                                 type="button"
//                                 onClick={toggleConfirmPasswordVisibility}
//                                 className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
//                             >
//                                 {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
//                             </button>
//                         </div>
//                     </div>

//                     {error && (
//                         <div className="mb-4 p-3 bg-red-900 bg-opacity-30 text-red-300 rounded-lg text-sm">
//                             {error}
//                         </div>
//                     )}

//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-3.5 px-4 rounded-lg font-bold shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-300"
//                     >
//                         {loading ? (
//                             <span className="flex items-center justify-center">
//                                 <FaSpinner className="animate-spin mr-2" />
//                                 Creating Account...
//                             </span>
//                         ) : "Sign Up"}
//                     </button>
//                 </form>

//                 <div className="mt-6 text-center">
//                     <p className="text-sm text-gray-400">
//                         Already have an account?{" "}
//                         <button
//                             type="button"
//                             onClick={() => navigate("/login")}
//                             className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
//                         >
//                             Login
//                         </button>
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default React.memo(Signup);






// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import {
//   FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaSpinner, FaGoogle,
//   FaFacebook, FaTwitter, FaInstagram, FaTiktok
// } from "react-icons/fa";
// import { RiShieldCheckFill } from "react-icons/ri";
// import { motion, AnimatePresence } from "framer-motion";
// import api from "../../api";
// import { useAuth } from "../../context/AuthContext";
// import zxcvbn from "zxcvbn";

// import signupImage1 from "../../assets/signupImage1.png";
// import signupImage2 from "../../assets/signupImage2.png";

// const Signup = () => {
//   const [form, setForm] = useState({ 
//     name: "", 
//     email: "", 
//     password: "", 
//     confirmPassword: "" 
//   });
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [emailValidating, setEmailValidating] = useState(false);
//   const [emailAvailable, setEmailAvailable] = useState(null);
//   const [currentImage, setCurrentImage] = useState(0);

//   const { isAuthenticated } = useAuth();

//   const images = useMemo(() => [
//     { src: signupImage1, alt: "Creative illustration 1" },
//     { src: signupImage2, alt: "Creative illustration 2" }
//   ], []);

//   // Image carousel with smooth transitions
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentImage(prev => (prev + 1) % images.length);
//     }, 5000);
//     return () => clearInterval(interval);
//   }, [images.length]);

//   // Email validation with debounce
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

//   return (
//     <div className="min-h-screen flex bg-gradient-to-br from-purple-900 to-indigo-900">
//       {/* Left: Image carousel with creative overlay */}
//       <div className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden">
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={currentImage}
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 1 }}
//             className="absolute inset-0"
//           >
//             <img
//               src={images[currentImage].src}
//               alt={images[currentImage].alt}
//               className="w-full h-full object-cover object-center"
//             />
//           </motion.div>
//         </AnimatePresence>
        
//         <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        
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
//                 className="bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all duration-300"
//               >
//                 <Icon className="text-white text-xl" />
//               </motion.a>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Right: Form with vibrant design */}
//       <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
//         <motion.div 
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.6 }}
//           className="w-full max-w-xl bg-gradient-to-br from-indigo-800 to-purple-800 rounded-3xl shadow-2xl overflow-hidden border border-indigo-600/30"
//         >
//           {/* Header with creative pattern */}
//           <div className="relative p-8 text-center bg-gradient-to-r from-indigo-600/30 to-purple-600/30">
//             <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]"></div>
//             <RiShieldCheckFill className="relative z-10 text-indigo-300 text-6xl mx-auto mb-4" />
//             <h2 className="relative z-10 text-3xl font-bold text-white mb-2">Create Your Account</h2>
//             <p className="relative z-10 text-indigo-200">Become part of something extraordinary</p>
//           </div>
          
//           <div className="p-8">
//             {/* Form with all fields visible */}
//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Name Field */}
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-indigo-200">Full Name</label>
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-400">
//                       <FaUser />
//                     </div>
//                     <input
//                       name="name"
//                       type="text"
//                       value={form.name}
//                       onChange={handleChange}
//                       placeholder="James Kirwa"
//                       required
//                       className="w-full pl-10 pr-4 py-3 bg-indigo-900/50 border border-indigo-700 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-white placeholder-indigo-400 transition-all"
//                     />
//                   </div>
//                 </div>

//                 {/* Email Field */}
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-indigo-200">Email Address</label>
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-400">
//                       <FaEnvelope />
//                     </div>
//                     <input
//                       name="email"
//                       type="email"
//                       value={form.email}
//                       onChange={handleChange}
//                       placeholder="example@email.com"
//                       required
//                       className="w-full pl-10 pr-10 py-3 bg-indigo-900/50 border border-indigo-700 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-white placeholder-indigo-400 transition-all"
//                     />
//                     <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
//                       {emailValidating ? (
//                         <FaSpinner className="animate-spin text-indigo-400" />
//                       ) : emailAvailable !== null && (
//                         <span className={`text-sm ${emailAvailable ? "text-green-400" : "text-red-400"}`}>
//                           {emailAvailable ? "✓" : "✗"}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Password Field */}
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-indigo-200">Password</label>
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-400">
//                       <FaLock />
//                     </div>
//                     <input
//                       name="password"
//                       type={showPassword ? "text" : "password"}
//                       value={form.password}
//                       onChange={handleChange}
//                       placeholder="••••••••"
//                       required
//                       className="w-full pl-10 pr-10 py-3 bg-indigo-900/50 border border-indigo-700 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-white placeholder-indigo-400 transition-all"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute inset-y-0 right-0 pr-3 flex items-center text-indigo-400 hover:text-white"
//                     >
//                       {showPassword ? <FaEyeSlash /> : <FaEye />}
//                     </button>
//                   </div>
                  
//                   {/* Password Strength Meter */}
//                   {form.password && (
//                     <div className="mt-2">
//                       <div className="w-full bg-indigo-900/30 rounded-full h-2 overflow-hidden">
//                         <div
//                           className={`h-full rounded-full transition-all duration-500 ${
//                             passwordStrength.score < 1 ? "bg-red-500" :
//                             passwordStrength.score < 2 ? "bg-orange-400" :
//                             passwordStrength.score < 3 ? "bg-yellow-400" :
//                             passwordStrength.score < 4 ? "bg-blue-400" : "bg-green-400"
//                           }`}
//                           style={{ width: `${strengthPercent}%` }}
//                         />
//                       </div>
//                       <div className="flex justify-between mt-1">
//                         <span className="text-xs text-indigo-300">
//                           Strength: {["Weak", "Fair", "Good", "Strong", "Very Strong"][passwordStrength.score]}
//                         </span>
//                         <span className="text-xs text-indigo-300">
//                           {form.password.length} characters
//                         </span>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Confirm Password Field */}
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium text-indigo-200">Confirm Password</label>
//                   <div className="relative">
//                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-400">
//                       <FaLock />
//                     </div>
//                     <input
//                       name="confirmPassword"
//                       type={showConfirmPassword ? "text" : "password"}
//                       value={form.confirmPassword}
//                       onChange={handleChange}
//                       placeholder="••••••••"
//                       required
//                       className="w-full pl-10 pr-10 py-3 bg-indigo-900/50 border border-indigo-700 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-white placeholder-indigo-400 transition-all"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                       className="absolute inset-y-0 right-0 pr-3 flex items-center text-indigo-400 hover:text-white"
//                     >
//                       {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
//                     </button>
//                   </div>
//                 </div>
//               </div>

//               {/* Google Signup Option */}
//               <div className="flex items-center my-4">
//                 <span className="flex-1 border-t border-indigo-600" />
//                 <span className="px-4 text-sm text-indigo-300">or continue with</span>
//                 <span className="flex-1 border-t border-indigo-600" />
//               </div>

//               <motion.button
//                 type="button"
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-indigo-900/40 border border-indigo-700 text-indigo-200 hover:text-white hover:bg-indigo-900/60 transition-all"
//               >
//                 <FaGoogle className="text-red-400 text-xl" />
//                 <span className="font-medium">Google</span>
//               </motion.button>

//               {/* Messages */}
//               {error && (
//                 <motion.div 
//                   initial={{ opacity: 0, y: -10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="p-3 bg-red-900/30 text-red-200 rounded-lg text-sm border border-red-700/50"
//                 >
//                   {error}
//                 </motion.div>
//               )}

//               {success && (
//                 <motion.div 
//                   initial={{ opacity: 0, y: -10 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="p-3 bg-green-900/30 text-green-200 rounded-lg text-sm border border-green-700/50"
//                 >
//                   {success}
//                 </motion.div>
//               )}

//               {/* Submit Button */}
//               <motion.button
//                 whileHover={{ scale: 1.01 }}
//                 whileTap={{ scale: 0.99 }}
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 rounded-lg shadow-lg transition-all duration-300"
//               >
//                 {loading ? (
//                   <span className="flex justify-center items-center">
//                     <FaSpinner className="animate-spin mr-2" />
//                     Creating Account...
//                   </span>
//                 ) : "Sign Up Now"}
//               </motion.button>
//             </form>

//             <div className="mt-6 text-center text-sm text-indigo-300">
//               Already have an account?{" "}
//               <button
//                 className="text-white hover:text-pink-300 font-medium hover:underline"
//               >
//                 Log In Here
//               </button>
//             </div>

//             <div className="mt-8 pt-6 border-t border-indigo-700/50">
//               <p className="text-xs text-indigo-400 text-center">
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
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaSpinner, FaGoogle, FaFacebook, FaTwitter, FaInstagram, FaTiktok } from "react-icons/fa";
import { RiShieldCheckFill } from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom"; // Added for navigation
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import zxcvbn from "zxcvbn";
import signupImage1 from "../../assets/signupImage1.png";
import signupImage2 from "../../assets/signupImage2.png";

const Signup = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailValidating, setEmailValidating] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const navigate = useNavigate(); // Added for navigation
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

  const validateEmail = useCallback(async (email) => {
    if (!email) return;
    setEmailValidating(true);
    try {
      await api.get(`/api/auth/check-email/?email=${encodeURIComponent(email)}`);
      setEmailAvailable(true);
    } catch {
      setEmailAvailable(false);
    } finally {
      setEmailValidating(false);
    }
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (form.email) validateEmail(form.email);
    }, 500);
    return () => clearTimeout(delay);
  }, [form.email, validateEmail]);

  const passwordStrength = useMemo(() => zxcvbn(form.password || ""), [form.password]);
  const strengthPercent = (passwordStrength.score * 100) / 4;

  const handleChange = useCallback(e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (passwordStrength.score < 2) {
      setError("Password too weak - please choose a stronger password");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/api/auth/users/", {
        email: form.email,
        password: form.password,
        re_password: form.confirmPassword,
        name: form.name,
      });
      
      setSuccess("Account created successfully! Please check your email to verify your account.");
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.email?.[0] || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-900 to-gray-800"> {/* Darker background */}
      <div className="hidden lg:flex w-1/2 items-center justify-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }} // Reduced transition time
            className="absolute inset-0"
          >
            <img
              src={images[currentImage].src}
              alt={images[currentImage].alt}
              className="w-full h-full object-cover object-center"
              loading="lazy" // Added for performance
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
            Welcome to the Future
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl opacity-90 mb-8"
          >
            Join our innovative platform and unlock exclusive features
          </motion.p>
          
          <div className="flex space-x-4">
            {[FaFacebook, FaTwitter, FaInstagram, FaTiktok].map((Icon, index) => (
              <motion.a
                key={index}
                href="#"
                whileHover={{ y: -5, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-gray-800/50 hover:bg-gray-700/50 backdrop-blur-sm p-3 rounded-full transition-all duration-200"
              >
                <Icon className="text-white text-xl" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }} // Faster transition
          className="w-full max-w-xl bg-gray-800/90 rounded-3xl shadow-2xl overflow-hidden border border-gray-700/50 backdrop-blur-md"
        >
          <div className="relative p-8 text-center bg-gradient-to-r from-gray-700/30 to-gray-600/30">
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]"></div>
            <RiShieldCheckFill className="relative z-10 text-gray-400 text-6xl mx-auto mb-4" />
            <h2 className="relative z-10 text-3xl font-bold text-white mb-2">Create Your Account</h2>
            <p className="relative z-10 text-gray-300">Become part of something extraordinary</p>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Full Name</label>
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
                      className="w-full pl-10 pr-4 py-3 bg-gray-900/70 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Email Address</label>
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
                      className="w-full pl-10 pr-10 py-3 bg-gray-900/70 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 transition-all duration-200"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      {emailValidating ? (
                        <FaSpinner className="animate-spin text-blue-500" />
                      ) : emailAvailable !== null && (
                        <span className={`text-sm ${emailAvailable ? "text-green-400" : "text-red-400"}`}>
                          {emailAvailable ? "✓" : "✗"}
                        </span>
                      )}
                    </div>
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
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-10 py-3 bg-gray-900/70 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 transition-all duration-200"
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
                    <div className="mt-2">
                      <div className="w-full bg-gray-900/50 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            passwordStrength.score < 1 ? "bg-red-500" :
                            passwordStrength.score < 2 ? "bg-orange-400" :
                            passwordStrength.score < 3 ? "bg-yellow-400" :
                            passwordStrength.score < 4 ? "bg-blue-400" : "bg-green-400"
                          }`}
                          style={{ width: `${strengthPercent}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-400">
                          Strength: {["Weak", "Fair", "Good", "Strong", "Very Strong"][passwordStrength.score]}
                        </span>
                        <span className="text-xs text-gray-400">
                          {form.password.length} characters
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Confirm Password</label>
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
                      className="w-full pl-10 pr-10 py-3 bg-gray-900/70 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 transition-all duration-200"
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

              <div className="flex items-center my-4">
                <span className="flex-1 border-t border-gray-700" />
                <span className="px-4 text-sm text-gray-400">or continue with</span>
                <span className="flex-1 border-t border-gray-700" />
              </div>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-gray-900/50 border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800/70 transition-all duration-200"
              >
                <FaGoogle className="text-red-400 text-xl" />
                <span className="font-medium">Google</span>
              </motion.button>

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
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-lg shadow-lg transition-all duration-200"
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
              <button
                onClick={handleLoginClick}
                className="text-white hover:text-blue-400 font-medium hover:underline"
              >
                Log In Here
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700/50">
              <p className="text-xs text-gray-500 text-center">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default React.memo(Signup);