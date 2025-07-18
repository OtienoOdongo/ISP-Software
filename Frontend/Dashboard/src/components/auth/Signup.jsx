
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





import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";
import { FaFacebook, FaInstagram, FaXTwitter, FaTiktok } from "react-icons/fa6";
import zxcvbn from "zxcvbn";

const images = [
  "/images/signup1.png",
  "/images/signup2.png",
];

const Signup = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordScore, setPasswordScore] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Slide images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle password strength
  useEffect(() => {
    const result = zxcvbn(formData.password);
    setPasswordScore(result.score);
  }, [formData.password]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");

      if (formData.password !== formData.confirmPassword) {
        return setError("Passwords do not match");
      }

      try {
        // API request to your backend (pseudo-code)
        const response = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
          navigate("/login");
        } else {
          setError(data.message || "Signup failed");
        }
      } catch (err) {
        setError("Something went wrong");
      }
    },
    [formData, navigate]
  );

  const passwordStrengthLabel = ["Too weak", "Weak", "Fair", "Strong", "Very strong"];

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Image Slider Section */}
      <div className="hidden md:flex w-1/2 items-center justify-center bg-black">
        <img src={images[currentImage]} alt="Signup slide" className="h-full w-full object-cover" />
      </div>

      {/* Form Section */}
      <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
        <h2 className="text-3xl font-bold mb-6 text-center text-slate-800">Create Your Account</h2>

        {error && <p className="text-red-500 text-sm mb-3 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center border rounded p-2">
            <FaUser className="mr-2 text-slate-600" />
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full outline-none"
            />
          </div>

          <div className="flex items-center border rounded p-2">
            <FaEnvelope className="mr-2 text-slate-600" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full outline-none"
            />
          </div>

          <div className="flex items-center border rounded p-2 relative">
            <FaLock className="mr-2 text-slate-600" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full outline-none"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 cursor-pointer"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {formData.password && (
            <div className="text-sm text-gray-600">
              Strength:{" "}
              <span className={`font-bold ${passwordScore < 3 ? "text-red-500" : "text-green-500"}`}>
                {passwordStrengthLabel[passwordScore]}
              </span>
            </div>
          )}

          <div className="flex items-center border rounded p-2">
            <FaLock className="mr-2 text-slate-600" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-800 text-white py-2 rounded hover:bg-slate-700 transition"
          >
            Sign Up
          </button>
        </form>

        {/* Social Login and Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600 mb-2">or sign up with</p>
          <div className="flex justify-center space-x-4 text-2xl text-slate-700">
            <FaGoogle className="cursor-pointer hover:text-red-500" />
            <FaFacebook className="cursor-pointer hover:text-blue-600" />
            <FaInstagram className="cursor-pointer hover:text-pink-600" />
            <FaXTwitter className="cursor-pointer hover:text-black" />
            <FaTiktok className="cursor-pointer hover:text-black" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
