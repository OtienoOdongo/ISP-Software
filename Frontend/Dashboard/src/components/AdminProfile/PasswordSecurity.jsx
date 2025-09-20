// // PasswordSecurity.js
// import React, { useState } from 'react';
// import { Lock, Shield, Eye, EyeOff, Key } from 'lucide-react';

// const PasswordSecurity = ({ user, theme }) => {
//   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [is2FAEnabled, setIs2FAEnabled] = useState(false);

//   const [formData, setFormData] = useState({
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: ''
//   });

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handlePasswordChange = (e) => {
//     e.preventDefault();
//     // Password change logic would go here
//     alert('Password change functionality would be implemented here');
//   };

//   const toggle2FA = () => {
//     setIs2FAEnabled(!is2FAEnabled);
//     // 2FA toggle logic would go here
//   };

//   return (
//     <div className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//       <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
//         <Shield className="w-6 h-6" /> Password & Security
//       </h2>

//       <div className="space-y-8">
//         {/* Change Password Section */}
//         <section>
//           <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
//             <Key className="w-5 h-5" /> Change Password
//           </h3>
          
//           <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
//             <div className="relative">
//               <label className="block text-sm font-medium mb-1">Current Password</label>
//               <input
//                 type={showCurrentPassword ? "text" : "password"}
//                 name="currentPassword"
//                 value={formData.currentPassword}
//                 onChange={handleInputChange}
//                 className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition ${theme === "dark" ? "bg-gray-600 text-white border border-gray-500" : "bg-gray-100 text-gray-800 border border-gray-300"}`}
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowCurrentPassword(!showCurrentPassword)}
//                 className="absolute right-3 top-10 text-gray-500"
//               >
//                 {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//               </button>
//             </div>

//             <div className="relative">
//               <label className="block text-sm font-medium mb-1">New Password</label>
//               <input
//                 type={showNewPassword ? "text" : "password"}
//                 name="newPassword"
//                 value={formData.newPassword}
//                 onChange={handleInputChange}
//                 className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition ${theme === "dark" ? "bg-gray-600 text-white border border-gray-500" : "bg-gray-100 text-gray-800 border border-gray-300"}`}
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowNewPassword(!showNewPassword)}
//                 className="absolute right-3 top-10 text-gray-500"
//               >
//                 {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//               </button>
//             </div>

//             <div className="relative">
//               <label className="block text-sm font-medium mb-1">Confirm New Password</label>
//               <input
//                 type={showConfirmPassword ? "text" : "password"}
//                 name="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={handleInputChange}
//                 className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition ${theme === "dark" ? "bg-gray-600 text-white border border-gray-500" : "bg-gray-100 text-gray-800 border border-gray-300"}`}
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                 className="absolute right-3 top-10 text-gray-500"
//               >
//                 {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//               </button>
//             </div>

//             <button
//               type="submit"
//               className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
//             >
//               Update Password
//             </button>
//           </form>
//         </section>

//         {/* Two-Factor Authentication Section */}
//         <section>
//           <h3 className="text-xl font-semibold mb-4">Two-Factor Authentication</h3>
//           <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-600" : "bg-gray-100"}`}>
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="font-medium">2FA Status: {is2FAEnabled ? "Enabled" : "Disabled"}</p>
//                 <p className="text-sm text-gray-500 mt-1">
//                   {is2FAEnabled 
//                     ? "Two-factor authentication is currently enabled for your account." 
//                     : "Add an extra layer of security to your account by enabling two-factor authentication."}
//                 </p>
//               </div>
//               <button
//                 onClick={toggle2FA}
//                 className={`px-4 py-2 rounded-lg ${is2FAEnabled ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} text-white transition`}
//               >
//                 {is2FAEnabled ? "Disable" : "Enable"} 2FA
//               </button>
//             </div>
//           </div>
//         </section>

//         {/* Last Login Info Section */}
//         <section>
//           <h3 className="text-xl font-semibold mb-4">Last Login Information</h3>
//           <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-600" : "bg-gray-100"}`}>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <p className="font-medium">Date & Time</p>
//                 <p>{new Date(user.lastLogin.timestamp).toLocaleString()}</p>
//               </div>
//               <div>
//                 <p className="font-medium">IP Address</p>
//                 <p>{user.lastLogin.ip}</p>
//               </div>
//               <div>
//                 <p className="font-medium">Device</p>
//                 <p>{user.lastLogin.device}</p>
//               </div>
//               <div>
//                 <p className="font-medium">Location</p>
//                 <p>{user.lastLogin.location}</p>
//               </div>
//             </div>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// };

// export default PasswordSecurity;



// import React, { useState } from 'react';
// import { Lock, Shield, Eye, EyeOff, Key } from 'lucide-react';
// import api from '../../api';

// const PasswordSecurity = ({ user, theme }) => {
//   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [formData, setFormData] = useState({
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: ''
//   });
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handlePasswordChange = async (e) => {
//     e.preventDefault();
//     if (formData.newPassword !== formData.confirmPassword) {
//       setError("New password and confirmation do not match");
//       return;
//     }

//     try {
//       await api.post("/api/auth/users/set_password/", {
//         current_password: formData.currentPassword,
//         new_password: formData.newPassword
//       });
//       setSuccess("Password updated successfully");
//       setError(null);
//       setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
//     } catch (err) {
//       setError(err.response?.data?.detail || "Failed to update password");
//       setSuccess(null);
//     }
//   };

//   const toggle2FA = async () => {
//     try {
//       await api.post("/api/account/twofa/", { enable: !user.is_2fa_enabled });
//       user.is_2fa_enabled = !user.is_2fa_enabled;
//       setSuccess(`2FA ${user.is_2fa_enabled ? 'enabled' : 'disabled'} successfully`);
//       setError(null);
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to update 2FA settings");
//       setSuccess(null);
//     }
//   };

//   return (
//     <div className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//       <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
//         <Shield className="w-6 h-6" /> Password & Security
//       </h2>

//       {error && (
//         <div className="bg-red-500 text-white p-4 rounded-lg mb-4">{error}</div>
//       )}
//       {success && (
//         <div className="bg-green-500 text-white p-4 rounded-lg mb-4">{success}</div>
//       )}

//       <div className="space-y-8">
//         <section>
//           <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
//             <Key className="w-5 h-5" /> Change Password
//           </h3>
          
//           <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
//             <div className="relative">
//               <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
//               <input
//                 type={showCurrentPassword ? "text" : "password"}
//                 name="currentPassword"
//                 value={formData.currentPassword}
//                 onChange={handleInputChange}
//                 className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition ${theme === "dark" ? "bg-gray-600 text-white border border-gray-500" : "bg-gray-100 text-gray-800 border border-gray-300"}`}
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowCurrentPassword(!showCurrentPassword)}
//                 className="absolute right-3 top-10 text-gray-500"
//               >
//                 {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//               </button>
//             </div>

//             <div className="relative">
//               <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
//               <input
//                 type={showNewPassword ? "text" : "password"}
//                 name="newPassword"
//                 value={formData.newPassword}
//                 onChange={handleInputChange}
//                 className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition ${theme === "dark" ? "bg-gray-600 text-white border border-gray-500" : "bg-gray-100 text-gray-800 border border-gray-300"}`}
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowNewPassword(!showNewPassword)}
//                 className="absolute right-3 top-10 text-gray-500"
//               >
//                 {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//               </button>
//             </div>

//             <div className="relative">
//               <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
//               <input
//                 type={showConfirmPassword ? "text" : "password"}
//                 name="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={handleInputChange}
//                 className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition ${theme === "dark" ? "bg-gray-600 text-white border border-gray-500" : "bg-gray-100 text-gray-800 border border-gray-300"}`}
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                 className="absolute right-3 top-10 text-gray-500"
//               >
//                 {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//               </button>
//             </div>

//             {user.is_2fa_enabled && (
//               <p className="text-xs text-yellow-400 mb-4">
//                 Note: 2FA is enabled. You will need to verify your identity after changing your password.
//               </p>
//             )}

//             <button
//               type="submit"
//               className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
//             >
//               Update Password
//             </button>
//           </form>
//         </section>

//         <section>
//           <h3 className="text-xl font-semibold mb-4">Two-Factor Authentication</h3>
//           <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-600" : "bg-gray-100"}`}>
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="font-medium">2FA Status: {user.is_2fa_enabled ? "Enabled" : "Disabled"}</p>
//                 <p className="text-sm text-gray-500 mt-1">
//                   {user.is_2fa_enabled
//                     ? "Two-factor authentication is currently enabled for your account."
//                     : "Add an extra layer of security to your account by enabling two-factor authentication."}
//                 </p>
//               </div>
//               <button
//                 onClick={toggle2FA}
//                 className={`px-4 py-2 rounded-lg ${user.is_2fa_enabled ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} text-white transition`}
//               >
//                 {user.is_2fa_enabled ? "Disable" : "Enable"} 2FA
//               </button>
//             </div>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// };

// export default PasswordSecurity;










// import React, { useState } from 'react';
// import { LockKeyhole, ShieldCheck, Eye, EyeOff, KeyRound } from 'lucide-react';
// import api from '../../api';
// import { toast } from 'react-hot-toast';

// const PasswordSecurity = ({ user, theme }) => {
//   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [formData, setFormData] = useState({
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: ''
//   });
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
//   const [passwordStrength, setPasswordStrength] = useState(0);
//   const [isLoading, setIsLoading] = useState(false);

//   const calculateStrength = (pass) => {
//     let strength = 0;
//     if (pass.length > 8) strength += 25;
//     if (/[A-Z]/.test(pass)) strength += 25;
//     if (/[0-9]/.test(pass)) strength += 25;
//     if (/[^A-Za-z0-9]/.test(pass)) strength += 25;
//     setPasswordStrength(strength);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     if (name === 'newPassword') calculateStrength(value);
//   };

//   const handlePasswordChange = async (e) => {
//     e.preventDefault();
    
//     if (formData.newPassword !== formData.confirmPassword) {
//       setError("Passwords don't match");
//       toast.error("Passwords don't match");
//       return;
//     }
    
//     if (passwordStrength < 75) {
//       setError("Password too weak. Include uppercase, numbers, and special characters.");
//       toast.error("Password too weak");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       await api.post("/api/auth/users/set_password/", {
//         current_password: formData.currentPassword,
//         new_password: formData.newPassword
//       });
//       setSuccess("Password updated successfully");
//       toast.success("Password updated!");
//       setError(null);
//       setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
//       setPasswordStrength(0);
//     } catch (err) {
//       setError(err.response?.data?.detail || "Failed to update password");
//       toast.error(err.response?.data?.detail || "Failed to update password");
//       setSuccess(null);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const toggle2FA = async () => {
//     if (!window.confirm(`Are you sure you want to ${user.is_2fa_enabled ? 'disable' : 'enable'} 2FA?`)) return;
//     setIsLoading(true);
//     try {
//       await api.post("/api/account/twofa/", { enable: !user.is_2fa_enabled });
//       user.is_2fa_enabled = !user.is_2fa_enabled;
//       setSuccess(`2FA ${user.is_2fa_enabled ? 'enabled' : 'disabled'} successfully`);
//       toast.success("2FA updated");
//       setError(null);
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to update 2FA settings");
//       toast.error("Failed to update 2FA settings");
//       setSuccess(null);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getPasswordStrengthColor = () => {
//     if (passwordStrength < 25) return 'bg-red-500';
//     if (passwordStrength < 50) return 'bg-orange-500';
//     if (passwordStrength < 75) return 'bg-yellow-500';
//     return 'bg-green-500';
//   };

//   const getPasswordStrengthText = () => {
//     if (passwordStrength < 25) return 'Very Weak';
//     if (passwordStrength < 50) return 'Weak';
//     if (passwordStrength < 75) return 'Medium';
//     if (passwordStrength < 100) return 'Strong';
//     return 'Very Strong';
//   };

//   return (
//     <div className={`rounded-xl p-6 shadow-lg ${
//       theme === "dark" 
//         ? "bg-gray-800/50 backdrop-blur-md text-white" 
//         : "bg-white/50 backdrop-blur-md text-gray-800"
//     }`}>
//       <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
//         <ShieldCheck className="w-6 h-6 text-indigo-500" /> Password & Security
//       </h2>

//       {error && (
//         <div className="bg-red-600/90 text-white p-4 rounded-lg mb-4 shadow">
//           {error}
//           <button 
//             onClick={() => setError(null)} 
//             className="ml-4 text-sm underline"
//           >
//             Dismiss
//           </button>
//         </div>
//       )}
      
//       {success && (
//         <div className="bg-green-600/90 text-white p-4 rounded-lg mb-4 shadow">
//           {success}
//           <button 
//             onClick={() => setSuccess(null)} 
//             className="ml-4 text-sm underline"
//           >
//             Dismiss
//           </button>
//         </div>
//       )}

//       <div className="space-y-8">
//         <section>
//           <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
//             <KeyRound className="w-5 h-5 text-blue-400" /> Change Password
//           </h3>
          
//           <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
//             <div className="relative">
//               <label className="block text-sm font-medium mb-1">Current Password</label>
//               <input
//                 type={showCurrentPassword ? "text" : "password"}
//                 name="currentPassword"
//                 value={formData.currentPassword}
//                 onChange={handleInputChange}
//                 className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition ${
//                   theme === "dark" 
//                     ? "bg-gray-700 text-white border-gray-600" 
//                     : "bg-gray-100 text-gray-800 border-gray-300"
//                 } border`}
//                 required
//                 aria-required="true"
//               />
//               <button 
//                 type="button" 
//                 onClick={() => setShowCurrentPassword(!showCurrentPassword)} 
//                 className="absolute right-3 top-10 text-gray-400"
//                 aria-label={showCurrentPassword ? "Hide password" : "Show password"}
//               >
//                 {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//               </button>
//             </div>

//             <div className="relative">
//               <label className="block text-sm font-medium mb-1">New Password</label>
//               <input
//                 type={showNewPassword ? "text" : "password"}
//                 name="newPassword"
//                 value={formData.newPassword}
//                 onChange={handleInputChange}
//                 className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition ${
//                   theme === "dark" 
//                     ? "bg-gray-700 text-white border-gray-600" 
//                     : "bg-gray-100 text-gray-800 border-gray-300"
//                 } border`}
//                 required
//                 aria-required="true"
//               />
//               <button 
//                 type="button" 
//                 onClick={() => setShowNewPassword(!showNewPassword)} 
//                 className="absolute right-3 top-10 text-gray-400"
//                 aria-label={showNewPassword ? "Hide password" : "Show password"}
//               >
//                 {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//               </button>
              
//               {formData.newPassword && (
//                 <div className="mt-2">
//                   <div className="flex justify-between items-center mb-1">
//                     <span className="text-xs">Password strength:</span>
//                     <span className={`text-xs font-medium ${getPasswordStrengthColor().replace('bg-', 'text-')}`}>
//                       {getPasswordStrengthText()}
//                     </span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div 
//                       className={`h-2 rounded-full ${getPasswordStrengthColor()} transition-all`} 
//                       style={{ width: `${passwordStrength}%` }}
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="relative">
//               <label className="block text-sm font-medium mb-1">Confirm New Password</label>
//               <input
//                 type={showConfirmPassword ? "text" : "password"}
//                 name="confirmPassword"
//                 value={formData.confirmPassword}
//                 onChange={handleInputChange}
//                 className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition ${
//                   theme === "dark" 
//                     ? "bg-gray-700 text-white border-gray-600" 
//                     : "bg-gray-100 text-gray-800 border-gray-300"
//                 } border`}
//                 required
//                 aria-required="true"
//               />
//               <button 
//                 type="button" 
//                 onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
//                 className="absolute right-3 top-10 text-gray-400"
//                 aria-label={showConfirmPassword ? "Hide password" : "Show password"}
//               >
//                 {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//               </button>
//             </div>

//             {user.is_2fa_enabled && (
//               <p className="text-xs text-yellow-400 mb-4">Note: 2FA is enabled. You may need to verify after changing your password.</p>
//             )}

//             <button 
//               type="submit" 
//               disabled={isLoading} 
//               className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
//             >
//               {isLoading ? 'Updating...' : 'Update Password'}
//             </button>
//           </form>
//         </section>

//         <section>
//           <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
//             <ShieldCheck className="w-5 h-5 text-blue-400" /> Two-Factor Authentication
//           </h3>
//           <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}>
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="font-medium">2FA Status: 
//                   <span className={user.is_2fa_enabled ? "text-green-500 ml-2" : "text-red-500 ml-2"}>
//                     {user.is_2fa_enabled ? "Enabled" : "Disabled"}
//                   </span>
//                 </p>
//                 <p className="text-sm text-gray-400 mt-1">
//                   {user.is_2fa_enabled 
//                     ? "Extra security is active on your account." 
//                     : "Enable for better protection against unauthorized access."}
//                 </p>
//               </div>
//               <button
//                 onClick={toggle2FA}
//                 disabled={isLoading}
//                 className={`px-4 py-2 rounded-lg ${
//                   user.is_2fa_enabled 
//                     ? "bg-red-600 hover:bg-red-700" 
//                     : "bg-green-600 hover:bg-green-700"
//                 } text-white transition disabled:opacity-50`}
//               >
//                 {isLoading ? 'Updating...' : user.is_2fa_enabled ? "Disable" : "Enable"} 2FA
//               </button>
//             </div>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// };

// export default PasswordSecurity;







import React, { useState, useMemo, useCallback } from 'react';
import { LockKeyhole, ShieldCheck, Eye, EyeOff, KeyRound } from 'lucide-react';
import api from '../../api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

// Password strength calculator with memoization
class PasswordStrengthCalculator {
  static calculateStrength(password) {
    if (!password) return 0;
    
    let strength = 0;
    // Length check
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 10;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    return Math.min(strength, 100);
  }

  static getStrengthColor(strength) {
    if (strength < 25) return 'red';
    if (strength < 50) return 'orange';
    if (strength < 75) return 'yellow';
    return 'green';
  }

  static getStrengthText(strength) {
    if (strength < 25) return 'Very Weak';
    if (strength < 50) return 'Weak';
    if (strength < 75) return 'Medium';
    if (strength < 100) return 'Strong';
    return 'Very Strong';
  }
}

const PasswordSecurity = ({ user, theme }) => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Memoized password strength
  const passwordStrength = useMemo(() => 
    PasswordStrengthCalculator.calculateStrength(formData.newPassword),
    [formData.newPassword]
  );

  const strengthColor = useMemo(() => 
    PasswordStrengthCalculator.getStrengthColor(passwordStrength),
    [passwordStrength]
  );

  const strengthText = useMemo(() => 
    PasswordStrengthCalculator.getStrengthText(passwordStrength),
    [passwordStrength]
  );

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handlePasswordChange = useCallback(async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords don't match");
      toast.error("Passwords don't match");
      return;
    }
    
    if (passwordStrength < 75) {
      setError("Password too weak. Include uppercase, numbers, and special characters.");
      toast.error("Password too weak");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/api/auth/users/set_password/", {
        current_password: formData.currentPassword,
        new_password: formData.newPassword
      });
      setSuccess("Password updated successfully");
      toast.success("Password updated!");
      setError(null);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update password");
      toast.error(err.response?.data?.detail || "Failed to update password");
      setSuccess(null);
    } finally {
      setIsLoading(false);
    }
  }, [formData, passwordStrength]);

  const toggle2FA = useCallback(async () => {
    if (!window.confirm(`Are you sure you want to ${user.is_2fa_enabled ? 'disable' : 'enable'} 2FA?`)) return;
    setIsLoading(true);
    try {
      await api.post("/api/account/twofa/", { enable: !user.is_2fa_enabled });
      user.is_2fa_enabled = !user.is_2fa_enabled;
      setSuccess(`2FA ${user.is_2fa_enabled ? 'enabled' : 'disabled'} successfully`);
      toast.success("2FA updated");
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update 2FA settings");
      toast.error("Failed to update 2FA settings");
      setSuccess(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const togglePasswordVisibility = useCallback((field) => {
    switch (field) {
      case 'current':
        setShowCurrentPassword(prev => !prev);
        break;
      case 'new':
        setShowNewPassword(prev => !prev);
        break;
      case 'confirm':
        setShowConfirmPassword(prev => !prev);
        break;
      default:
        break;
    }
  }, []);

  return (
    <div className={`rounded-xl p-6 shadow-lg ${
      theme === "dark" 
        ? "bg-gray-800/60 backdrop-blur-md text-white" 
        : "bg-white/60 backdrop-blur-md text-gray-800"
    }`}>
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <ShieldCheck className="w-6 h-6 text-indigo-500" /> Password & Security
      </h2>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-600/90 text-white p-4 rounded-lg mb-4 shadow"
          >
            {error}
            <button 
              onClick={() => setError(null)} 
              className="ml-4 text-sm underline"
            >
              Dismiss
            </button>
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-600/90 text-white p-4 rounded-lg mb-4 shadow"
          >
            {success}
            <button 
              onClick={() => setSuccess(null)} 
              className="ml-4 text-sm underline"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-blue-400" /> Change Password
          </h3>
          
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div className="relative">
              <label className={`block text-sm font-medium mb-1 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>Current Password</label>
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                  theme === "dark" 
                    ? "bg-gray-700 text-white border-gray-600" 
                    : "bg-gray-100 text-gray-800 border-gray-300"
                } border`}
                required
                aria-required="true"
              />
              <button 
                type="button" 
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-10 text-gray-400"
                aria-label={showCurrentPassword ? "Hide password" : "Show password"}
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <label className={`block text-sm font-medium mb-1 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>New Password</label>
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                  theme === "dark" 
                    ? "bg-gray-700 text-white border-gray-600" 
                    : "bg-gray-100 text-gray-800 border-gray-300"
                } border`}
                required
                aria-required="true"
              />
              <button 
                type="button" 
                onClick={() => togglePasswordVisibility('new')}
                className="absolute right-3 top-10 text-gray-400"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Password strength:</span>
                    <span className={`text-xs font-medium text-${strengthColor}-500`}>
                      {strengthText}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-${strengthColor}-500 transition-all`} 
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <label className={`block text-sm font-medium mb-1 ${
                theme === "dark" ? "text-gray-300" : "text-gray-700"
              }`}>Confirm New Password</label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                  theme === "dark" 
                    ? "bg-gray-700 text-white border-gray-600" 
                    : "bg-gray-100 text-gray-800 border-gray-300"
                } border`}
                required
                aria-required="true"
              />
              <button 
                type="button" 
                onClick={() => togglePasswordVisibility('confirm')}
                className="absolute right-3 top-10 text-gray-400"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {user.is_2fa_enabled && (
              <p className="text-xs text-yellow-400 mb-4">Note: 2FA is enabled. You may need to verify after changing your password.</p>
            )}

            <button 
              type="submit" 
              disabled={isLoading} 
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" /> Two-Factor Authentication
          </h3>
          <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-700" : "bg-gray-100"}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">2FA Status: 
                  <span className={user.is_2fa_enabled ? "text-green-500 ml-2" : "text-red-500 ml-2"}>
                    {user.is_2fa_enabled ? "Enabled" : "Disabled"}
                  </span>
                </p>
                <p className={`text-sm mt-1 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                  {user.is_2fa_enabled 
                    ? "Extra security is active on your account." 
                    : "Enable for better protection against unauthorized access."}
                </p>
              </div>
              <button
                onClick={toggle2FA}
                disabled={isLoading}
                className={`px-4 py-2 rounded-lg ${
                  user.is_2fa_enabled 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "bg-green-600 hover:bg-green-700"
                } text-white transition-all disabled:opacity-50`}
              >
                {isLoading ? 'Updating...' : user.is_2fa_enabled ? "Disable" : "Enable"} 2FA
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default React.memo(PasswordSecurity);