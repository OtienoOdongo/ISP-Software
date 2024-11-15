import { IoIosSearch } from "react-icons/io";
import { LuBellRing } from "react-icons/lu";
import { BsChevronDown } from "react-icons/bs";
import { LuUserCircle2 } from "react-icons/lu";
import { CiSettings } from "react-icons/ci";
import { TbLogout2 } from "react-icons/tb";
import avatar from "../assets/avatar.png";
import { useState } from "react";

/**
 * TopBar Component
 * Top bar with search, notifications, and user profile features
 * Includes:
 * - Search functionality
 * - Notification bell
 * - Dynamic user profile picture with dropdown
 */

const TopBar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock user data - Replace this with your actual user data from authentication
  const user = {
    name: "Clinto Odongo",
    profilePic: "", // Replace with actual image URL
    email: "otienoclinto86@gmail.com"
  };

  // Handle search input changes
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    // Add your search logic here
  };

  // Toggle profile dropdown
  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <div className="border-b h-14 flex bg-white items-center justify-between px-4">
      {/* Search Section */}
      <div className="relative">
        <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
        <input
          type="search"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearch}
          className="text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                   px-4 py-2 rounded-md border border-slate-200
                   pl-10 pr-4 w-64"
          aria-label="Search"
        />
      </div>

      {/* Notifications */}
      <button
        className="p-2 hover:bg-slate-400 rounded-full transition-colors ml-auto"
        aria-label="Notifications"
      >
        <LuBellRing className="w-5 h-5 text-slate-500 hover:text-white mr-2" />
      </button>

      {/* User Profile with Dynamic Image */}
      <div className="relative">
        <button
          onClick={toggleProfile}
          className="flex items-center space-x-2 p-2 rounded-lg transition-colors"
          aria-expanded={isProfileOpen}
          aria-label="User menu"
        >
          {/* Dynamic Profile Picture */}
          {user.profilePic ? (
            <img
              src={user.profilePic}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                // Fallback if image fails to load
                e.target.src = {avatar};
              }}
            />
          ) : (
            // Fallback profile icon when no image is available
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 text-lg font-semibold">
                {user.name.charAt(0)}
              </span>
            </div>
          )}
          <BsChevronDown className={`${isProfileOpen && "rotate-180"}`} />
        </button>

        {/* Enhanced Profile Dropdown Menu */}
        {isProfileOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50">
            {/* User Info Section */}
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
            <ul className="py-1">
              <li>
                <a
                  href="/profile"
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex gap-2"
                >
                  <LuUserCircle2 className="w-7 h-7 text-gray-500"/>
                  Profile
                </a>
              </li>
              <li>
                <a
                  href="/settings"
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex gap-2"
                >
                  <CiSettings className="w-7 h-7 text-gray-500"/>
                  Settings
                </a>
              </li>
              <li>
                <a
                  href="/logout"
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex gap-2"
                >
                  <TbLogout2 className="w-7 h-7 text-gray-500"/>
                  Log Out
                </a>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;
