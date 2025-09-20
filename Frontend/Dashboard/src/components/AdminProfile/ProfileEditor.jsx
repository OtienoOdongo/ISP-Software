// // src/components/AdminProfile/ProfileEditor.jsx
// import React, { useState, useEffect } from "react";
// import { Camera, Save, X, User, Mail, Shield, CheckCircle } from "lucide-react";

// const ProfileEditor = ({ profile, onSave, onCancel, theme = "light" }) => {
//   const [formData, setFormData] = useState({
//     fullName: "",
//     email: "",
//     role: "admin",
//     profilePicture: "",
//   });

//   const [imagePreview, setImagePreview] = useState("");

//   useEffect(() => {
//     if (profile) {
//       setFormData({
//         fullName: profile.fullName || "",
//         email: profile.email || "",
//         role: profile.role || "admin",
//         profilePicture: profile.profilePicture || "",
//       });
//       setImagePreview(profile.profilePicture || "");
//     }
//   }, [profile]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result);
//         setFormData(prev => ({ ...prev, profilePicture: file }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSave(formData);
//   };

//   return (
//     <div className={`rounded-2xl shadow-lg p-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
//       <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//         <User className="text-indigo-500" />
//         Edit Profile
//       </h2>
      
//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Profile Picture Upload */}
//         <div className="flex flex-col items-center">
//           <div className="relative mb-4">
//             <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${theme === "dark" ? "border-gray-700" : "border-indigo-100"}`}>
//               <img
//                 src={imagePreview || "/default-avatar.png"}
//                 alt="Profile preview"
//                 className="w-full h-full object-cover"
//               />
//             </div>
//             <label
//               htmlFor="profilePicture"
//               className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition-all shadow-md"
//             >
//               <Camera size={18} className="text-white" />
//               <input
//                 type="file"
//                 id="profilePicture"
//                 name="profilePicture"
//                 className="hidden"
//                 onChange={handleImageChange}
//                 accept="image/*"
//               />
//             </label>
//           </div>
//           <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
//             Click the camera icon to change your profile picture
//           </p>
//         </div>

//         {/* Full Name */}
//         <div>
//           <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
//             <User size={16} />
//             Full Name
//           </label>
//           <input
//             type="text"
//             name="fullName"
//             value={formData.fullName}
//             onChange={handleChange}
//             placeholder="Enter your full name"
//             className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
//               theme === "dark" 
//                 ? "border-gray-600 bg-gray-700 text-white" 
//                 : "border-gray-300 bg-white text-gray-800"
//             }`}
//             required
//           />
//         </div>

//         {/* Email */}
//         <div>
//           <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
//             <Mail size={16} />
//             Email Address
//           </label>
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             placeholder="Enter your email address"
//             className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
//               theme === "dark" 
//                 ? "border-gray-600 bg-gray-700 text-white" 
//                 : "border-gray-300 bg-white text-gray-800"
//             }`}
//             required
//           />
//         </div>

//         {/* Role */}
//         <div>
//           <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
//             <Shield size={16} />
//             Role
//           </label>
//           <select
//             name="role"
//             value={formData.role}
//             onChange={handleChange}
//             className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
//               theme === "dark" 
//                 ? "border-gray-600 bg-gray-700 text-white" 
//                 : "border-gray-300 bg-white text-gray-800"
//             }`}
//           >
//             <option value="admin">Admin</option>
//             <option value="superadmin">Super Admin</option>
//           </select>
//         </div>

//         {/* Status Display (Read-only) */}
//         <div className={`p-3 rounded-lg border ${
//           theme === "dark" 
//             ? "bg-green-900/30 border-green-800" 
//             : "bg-green-50 border-green-200"
//         }`}>
//           <div className={`flex items-center gap-2 ${
//             theme === "dark" ? "text-green-400" : "text-green-700"
//           }`}>
//             <CheckCircle size={16} />
//             <span className="font-medium">Status: Active</span>
//           </div>
//           <p className={`text-sm mt-1 ${
//             theme === "dark" ? "text-green-300" : "text-green-600"
//           }`}>
//             Your account is active and in good standing.
//           </p>
//         </div>

//         {/* Actions */}
//         <div className="flex justify-end gap-3 pt-4">
//           <button
//             type="button"
//             onClick={onCancel}
//             className={`px-5 py-2.5 rounded-lg border flex items-center gap-2 ${
//               theme === "dark" 
//                 ? "border-gray-600 text-gray-300 hover:bg-gray-700" 
//                 : "border-gray-300 text-gray-700 hover:bg-gray-50"
//             } transition-colors`}
//           >
//             <X size={18} />
//             Cancel
//           </button>
//           <button
//             type="submit"
//             className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
//           >
//             <Save size={18} />
//             Save Changes
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ProfileEditor;








// // src/components/AdminProfile/ProfileEditor.jsx
// import React, { useState, useEffect } from "react";
// import { Camera, Save, X, User, Mail, Shield, CheckCircle } from "lucide-react";

// const ProfileEditor = ({ profile, onSave, onCancel, theme = "light" }) => {
//   const [formData, setFormData] = useState({
//     fullName: "",
//     email: "",
//     role: "admin",
//     profilePicture: null, // Changed to null to handle file object
//   });

//   const [imagePreview, setImagePreview] = useState("");

//   useEffect(() => {
//     if (profile) {
//       setFormData({
//         fullName: profile.fullName || "",
//         email: profile.email || "",
//         role: profile.role || "admin",
//         profilePicture: null, // File input starts empty
//       });
//       setImagePreview(profile.profilePicture || "");
//     }
//   }, [profile]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (!file.type.startsWith("image/")) {
//         alert("Please upload an image file.");
//         return;
//       }
//       if (file.size > 5 * 1024 * 1024) {
//         alert("File size must be less than 5MB.");
//         return;
//       }
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreview(reader.result);
//         setFormData((prev) => ({ ...prev, profilePicture: file }));
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSave(formData);
//   };

//   return (
//     <div className={`rounded-2xl shadow-lg p-6 ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
//       <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${theme === "dark" ? "text-white" : "text-gray-800"}`}>
//         <User className="text-indigo-500" />
//         Edit Profile
//       </h2>
      
//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Profile Picture Upload */}
//         <div className="flex flex-col items-center">
//           <div className="relative mb-4">
//             <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${theme === "dark" ? "border-gray-700" : "border-indigo-100"}`}>
//               <img
//                 src={imagePreview || "/default-avatar.png"}
//                 alt="Profile preview"
//                 className="w-full h-full object-cover"
//               />
//             </div>
//             <label
//               htmlFor="profilePicture"
//               className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition-all shadow-md"
//             >
//               <Camera size={18} className="text-white" />
//               <input
//                 type="file"
//                 id="profilePicture"
//                 name="profilePicture"
//                 className="hidden"
//                 onChange={handleImageChange}
//                 accept="image/*"
//               />
//             </label>
//           </div>
//           <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
//             Click the camera icon to change your profile picture
//           </p>
//         </div>

//         {/* Full Name */}
//         <div>
//           <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
//             <User size={16} />
//             Full Name
//           </label>
//           <input
//             type="text"
//             name="fullName"
//             value={formData.fullName}
//             onChange={handleChange}
//             placeholder="Enter your full name"
//             className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
//               theme === "dark" 
//                 ? "border-gray-600 bg-gray-700 text-white" 
//                 : "border-gray-300 bg-white text-gray-800"
//             }`}
//             required
//           />
//         </div>

//         {/* Email */}
//         <div>
//           <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
//             <Mail size={16} />
//             Email Address
//           </label>
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             placeholder="Enter your email address"
//             className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
//               theme === "dark" 
//                 ? "border-gray-600 bg-gray-700 text-white" 
//                 : "border-gray-300 bg-white text-gray-800"
//             }`}
//             required
//           />
//         </div>

//         {/* Role */}
//         <div>
//           <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
//             <Shield size={16} />
//             Role
//           </label>
//           <select
//             name="role"
//             value={formData.role}
//             onChange={handleChange}
//             className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
//               theme === "dark" 
//                 ? "border-gray-600 bg-gray-700 text-white" 
//                 : "border-gray-300 bg-white text-gray-800"
//             }`}
//           >
//             <option value="admin">Admin</option>
//             <option value="superadmin">Super Admin</option>
//           </select>
//         </div>

//         {/* Status Display (Read-only) */}
//         <div className={`p-3 rounded-lg border ${
//           theme === "dark" 
//             ? "bg-green-900/30 border-green-800" 
//             : "bg-green-50 border-green-200"
//         }`}>
//           <div className={`flex items-center gap-2 ${
//             theme === "dark" ? "text-green-400" : "text-green-700"
//           }`}>
//             <CheckCircle size={16} />
//             <span className="font-medium">Status: Active</span>
//           </div>
//           <p className={`text-sm mt-1 ${
//             theme === "dark" ? "text-green-300" : "text-green-600"
//           }`}>
//             Your account is active and in good standing.
//           </p>
//         </div>

//         {/* Actions */}
//         <div className="flex justify-end gap-3 pt-4">
//           <button
//             type="button"
//             onClick={onCancel}
//             className={`px-5 py-2.5 rounded-lg border flex items-center gap-2 ${
//               theme === "dark" 
//                 ? "border-gray-600 text-gray-300 hover:bg-gray-700" 
//                 : "border-gray-300 text-gray-700 hover:bg-gray-50"
//             } transition-colors`}
//           >
//             <X size={18} />
//             Cancel
//           </button>
//           <button
//             type="submit"
//             className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
//           >
//             <Save size={18} />
//             Save Changes
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ProfileEditor;







import React, { useState, useEffect, useCallback } from "react";
import { Camera, Save, X, User, Mail, Shield, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

// Profile data validator
class ProfileValidator {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateName(name) {
    return name.length >= 2 && name.length <= 50;
  }

  static validateFile(file) {
    if (!file) return true;
    if (!file.type.startsWith("image/")) return false;
    if (file.size > 5 * 1024 * 1024) return false;
    return true;
  }
}

const ProfileEditor = ({ profile, onSave, onCancel, theme = "light" }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "admin",
    profilePicture: null,
  });

  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || "",
        email: profile.email || "",
        role: profile.role || "admin",
        profilePicture: null,
      });
      setImagePreview(profile.profilePicture || "");
    }
  }, [profile]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!ProfileValidator.validateName(formData.fullName)) {
      newErrors.fullName = "Name must be between 2 and 50 characters";
    }

    if (!ProfileValidator.validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (formData.profilePicture && !ProfileValidator.validateFile(formData.profilePicture)) {
      newErrors.profilePicture = "Please upload a valid image file (max 5MB)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ProfileValidator.validateFile(file)) {
      setErrors(prev => ({ 
        ...prev, 
        profilePicture: "Please upload a valid image file (max 5MB)" 
      }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData(prev => ({ ...prev, profilePicture: file }));
      setErrors(prev => ({ ...prev, profilePicture: null }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  }, [formData, validateForm, onSave]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl shadow-lg p-6 ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}
    >
      <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${
        theme === "dark" ? "text-white" : "text-gray-800"
      }`}>
        <User className="text-indigo-500" />
        Edit Profile
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture Upload */}
        <div className="flex flex-col items-center">
          <div className="relative mb-4">
            <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${
              theme === "dark" ? "border-gray-700" : "border-indigo-100"
            }`}>
              <img
                src={imagePreview || "/default-avatar.png"}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            </div>
            <label
              htmlFor="profilePicture"
              className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition-all shadow-md"
            >
              <Camera size={18} className="text-white" />
              <input
                type="file"
                id="profilePicture"
                name="profilePicture"
                className="hidden"
                onChange={handleImageChange}
                accept="image/*"
              />
            </label>
          </div>
          {errors.profilePicture && (
            <p className="text-red-500 text-sm mt-1">{errors.profilePicture}</p>
          )}
          <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
            Click the camera icon to change your profile picture
          </p>
        </div>

        {/* Full Name */}
        <div>
          <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}>
            <User size={16} />
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              theme === "dark" 
                ? "border-gray-600 bg-gray-700 text-white" 
                : "border-gray-300 bg-white text-gray-800"
            } ${errors.fullName ? 'border-red-500' : ''}`}
            required
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}>
            <Mail size={16} />
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              theme === "dark" 
                ? "border-gray-600 bg-gray-700 text-white" 
                : "border-gray-300 bg-white text-gray-800"
            } ${errors.email ? 'border-red-500' : ''}`}
            required
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label className={`block text-sm font-medium mb-2 flex items-center gap-2 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}>
            <Shield size={16} />
            Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={`w-full p-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              theme === "dark" 
                ? "border-gray-600 bg-gray-700 text-white" 
                : "border-gray-300 bg-white text-gray-800"
            }`}
          >
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
        </div>

        {/* Status Display (Read-only) */}
        <div className={`p-3 rounded-lg border ${
          theme === "dark" 
            ? "bg-green-900/30 border-green-800" 
            : "bg-green-50 border-green-200"
        }`}>
          <div className={`flex items-center gap-2 ${
            theme === "dark" ? "text-green-400" : "text-green-700"
          }`}>
            <CheckCircle size={16} />
            <span className="font-medium">Status: Active</span>
          </div>
          <p className={`text-sm mt-1 ${
            theme === "dark" ? "text-green-300" : "text-green-600"
          }`}>
            Your account is active and in good standing.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-5 py-2.5 rounded-lg border flex items-center gap-2 ${
              theme === "dark" 
                ? "border-gray-600 text-gray-300 hover:bg-gray-700" 
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            } transition-colors`}
          >
            <X size={18} />
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Save size={18} />
            Save Changes
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default React.memo(ProfileEditor);