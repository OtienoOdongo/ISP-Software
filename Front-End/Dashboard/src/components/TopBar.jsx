import { IoIosSearch } from "react-icons/io";
import { LuBellRing } from "react-icons/lu";
import { BsChevronDown } from "react-icons/bs";
import { LuUserCircle2 } from "react-icons/lu";
import { CiSettings } from "react-icons/ci";
import { TbLogout2 } from "react-icons/tb";
import { FiHelpCircle } from "react-icons/fi";
import { MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md";
import avatar from "../assets/avatar.png";
import { useState } from "react";

const TopBar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount, setNotificationCount] = useState(5);
  const [themeIcon, setThemeIcon] = useState("light"); // "light" or "dark"
  const [language, setLanguage] = useState("EN");

  const user = {
    name: "Fridah Auma",
    profilePic: "",
    email: "mildredauma@gmail.com",
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const toggleLanguageMenu = () => {
    setIsLanguageOpen(!isLanguageOpen);
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    setIsLanguageOpen(false); // Close the dropdown after selection
  };

  return (
    <div className="border-b h-14 flex items-center justify-between px-4 bg-white text-gray-800">
      {/* Search Section */}
      <div className="relative">
        <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
        <input
          type="search"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearch}
          className="text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 px-4 py-2 rounded-md border border-gray-200 pl-10 pr-4 w-64"
          aria-label="Search"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <button
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Theme Toggle"
        >
          {themeIcon === "light" ? (
            <MdOutlineLightMode className="w-6 h-6 text-yellow-500" />
          ) : (
            <MdOutlineDarkMode className="w-6 h-6 text-gray-700" />
          )}
        </button>

        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={toggleLanguageMenu}
            className="p-2 hover:bg-gray-100 rounded-full flex items-center space-x-1"
            aria-label="Language Selector"
          >
            <span className="text-sm font-medium">{language}</span>
            <BsChevronDown className="w-4 h-4" />
          </button>
          {isLanguageOpen && (
            <div className="absolute right-0 top-10 w-32 bg-white rounded-md shadow-lg py-1 z-50">
              {["EN", "SW"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => changeLanguage(lang)}
                  className={`block px-4 py-2 text-sm ${
                    language === lang
                      ? "bg-gray-100 text-blue-500 font-semibold"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {lang === "EN" ? "English" : "Swahili"}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            className="p-2 hover:bg-gray-100 rounded-full relative"
            aria-label="Notifications"
          >
            <LuBellRing className="w-6 h-6 text-gray-500" />
            {notificationCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>
        </div>

        {/* Help */}
        <button
          className="p-2 hover:bg-gray-100 rounded-full"
          aria-label="Help"
        >
          <FiHelpCircle className="w-6 h-6 text-gray-500" />
        </button>

        {/* User Profile */}
        <div className="relative flex items-center space-x-2">
          <span className="text-sm font-medium">{user.name}</span>
          <button
            onClick={toggleProfile}
            className="flex items-center space-x-2 p-2 rounded-lg"
            aria-expanded={isProfileOpen}
            aria-label="User menu"
          >
            {user.profilePic ? (
              <img
                src={user.profilePic}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = avatar;
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-lg font-semibold">
                  {user.name.charAt(0)}
                </span>
              </div>
            )}
            <BsChevronDown className={`${isProfileOpen && "rotate-180"}`} />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 top-14 w-64 bg-white rounded-md shadow-lg py-1 z-50">
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <ul className="py-1">
                <li>
                  <a
                    href="/profile"
                    className="px-4 py-2 text-sm flex gap-2 hover:bg-gray-100"
                  >
                    <LuUserCircle2 className="w-6 h-6 text-gray-500" />
                    Profile
                  </a>
                </li>
                <li>
                  <a
                    href="/settings"
                    className="px-4 py-2 text-sm flex gap-2 hover:bg-gray-100"
                  >
                    <CiSettings className="w-6 h-6 text-gray-500" />
                    Settings
                  </a>
                </li>
                <li>
                  <a
                    href="/logout"
                    className="px-4 py-2 text-sm flex gap-2 hover:bg-gray-100"
                  >
                    <TbLogout2 className="w-6 h-6 text-gray-500" />
                    Log Out
                  </a>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
              