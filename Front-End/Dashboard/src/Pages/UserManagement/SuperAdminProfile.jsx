import React, { useState } from "react";
import { CameraIcon, SettingsIcon, FileTextIcon, DollarSignIcon } from "lucide-react";
import avatar from "../../assets/avatar.png"

const SuperAdminProfile = () => {
  // Dynamic State for Profile Data
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    phone: "+1 234 567 890",
    role: "Super Admin",
    clients: 25,
    activeClients: 18,
    subscriptions: 50,
    profilePic: "", // Default null for custom uploaded pic
  });

  // State for Edit Mode
  const [isEditing, setIsEditing] = useState(false);

  // State for Change Password
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  // Handle Save Profile
  const handleSave = () => {
    setIsEditing(false);
    // Perform save action (e.g., API call)
    console.log("Profile saved:", profile);
  };

  // Handle Change Password
  const handlePasswordChange = () => {
    // Add password change logic here (e.g., API call)
    console.log("Password changed:", passwordForm);
    setIsChangingPassword(false);
  };

  // File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile({ ...profile, profilePic: URL.createObjectURL(file) });
    }
  };

  return (
    <div className="grid grid-cols-[1fr_3fr] gap-6 min-h-screen p-6 bg-gray-100">
      {/* Sidebar Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex flex-col items-center gap-4">
          {/* Profile Picture */}
          <div className="relative w-32 h-32">
            <img
              src={profile.profilePic || avatar} // Default avatar if no profile pic you can also use https://via.placeholder.com/150
              alt="Profile"
              className="w-full h-full object-cover rounded-full border-2 border-gray-300"
            />
            <label
              htmlFor="profile-pic-upload"
              className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer"
              title="Change Profile Picture"
            >
              <CameraIcon size={20} />
            </label>
            <input
              type="file"
              id="profile-pic-upload"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*"
            />
          </div>

          {/* Role and Name */}
          <h2 className="text-lg font-semibold">{profile.name}</h2>
          <p className="text-sm text-gray-500">{profile.role}</p>
        </div>

        {/* Sidebar Links */}
        <ul className="mt-6 space-y-4">
          <li className="flex items-center gap-3 text-gray-700 cursor-pointer hover:text-blue-500">
            <SettingsIcon size={20} />
            <span>Account Settings</span>
          </li>
          <li className="flex items-center gap-3 text-gray-700 cursor-pointer hover:text-blue-500">
            <FileTextIcon size={20} />
            <span>Reports</span>
          </li>
          <li className="flex items-center gap-3 text-gray-700 cursor-pointer hover:text-blue-500">
            <DollarSignIcon size={20} />
            <span>Payments</span>
          </li>
        </ul>
      </div>

      {/* Main Content Section */}
      <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Admin Profile</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
            <button
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg shadow-md">
            <h3 className="text-sm text-gray-500">Total Clients</h3>
            <p className="text-lg font-semibold text-blue-600">{profile.clients}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow-md">
            <h3 className="text-sm text-gray-500">Active Clients</h3>
            <p className="text-lg font-semibold text-green-600">{profile.activeClients}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg shadow-md">
            <h3 className="text-sm text-gray-500">Total Subscriptions</h3>
            <p className="text-lg font-semibold text-purple-600">{profile.subscriptions}</p>
          </div>
        </div>

        {/* Editable Profile Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="w-32 text-gray-600">Name</label>
            {isEditing ? (
              <input
                type="text"
                placeholder="Enter Name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-blue-500"
              />
            ) : (
              <p className="flex-1 text-gray-700">{profile.name}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <label className="w-32 text-gray-600">Email</label>
            {isEditing ? (
              <input
                type="email"
                placeholder="example@domain.com"
                name="email"
                value={profile.email}
                onChange={handleChange}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-blue-500"
              />
            ) : (
              <p className="flex-1 text-gray-700">{profile.email}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <label className="w-32 text-gray-600">Phone</label>
            {isEditing ? (
              <input
                type="tel"
                placeholder="+2547001234566"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-blue-500"
              />
            ) : (
              <p className="flex-1 text-gray-700">{profile.phone}</p>
            )}
          </div>
        </div>

        {/* Password Change */}
        {isChangingPassword && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="w-32 text-gray-600">Current Password</label>
              <input
                type="password"
                placeholder="Current Password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-blue-500"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-32 text-gray-600">New Password</label>
              <input
                type="password"
                placeholder="New Password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-blue-500"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-32 text-gray-600">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm Password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-blue-500"
              />
            </div>
            <button
              onClick={handlePasswordChange}
              className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
            >
              Change Password
            </button>
          </div>
        )}

        {/* Save Profile Button */}
        {isEditing && (
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Save Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default SuperAdminProfile;
