







// import { IoIosSearch, IoIosMenu } from "react-icons/io";
// import { LuBellRing, LuUser } from "react-icons/lu";
// import { BsChevronDown } from "react-icons/bs";
// import { TbLogout2 } from "react-icons/tb";
// import { FiHelpCircle } from "react-icons/fi";
// import { MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md";
// import avatar from "../assets/avatar.png";
// import { useState, useEffect, useRef, useCallback } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { useTheme } from "../context/ThemeContext"; 

// const TopBar = ({ onMenuToggle }) => {
//   const { isAuthenticated, userDetails, loading, logout } = useAuth();
//   const { theme, toggleTheme } = useTheme();
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const [isLanguageOpen, setIsLanguageOpen] = useState(false);
//   const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [notificationCount, setNotificationCount] = useState(0);
//   const [language, setLanguage] = useState("EN");
//   const navigate = useNavigate();
//   const profileRef = useRef(null);
//   const notificationsRef = useRef(null);
//   const languageRef = useRef(null);

//   const handleLogout = useCallback(() => {
//     logout();
//     navigate("/login", { replace: true });
//   }, [logout, navigate]);

//   const handleSearch = useCallback((e) => {
//     setSearchQuery(e.target.value);
//   }, []);

//   const performSearch = useCallback(() => {
//     console.log("Search for:", searchQuery);
//   }, [searchQuery]);

//   const toggleProfile = useCallback(() => {
//     setIsProfileOpen(prev => !prev);
//   }, []);

//   const toggleLanguageMenu = useCallback(() => {
//     setIsLanguageOpen(prev => !prev);
//   }, []);

//   const changeLanguage = useCallback((lang) => {
//     setLanguage(lang);
//     setIsLanguageOpen(false);
//   }, []);

//   const toggleNotifications = useCallback(() => {
//     setIsNotificationsOpen(prev => !prev);
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (profileRef.current && !profileRef.current.contains(event.target)) {
//         setIsProfileOpen(false);
//       }
//       if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
//         setIsNotificationsOpen(false);
//       }
//       if (languageRef.current && !languageRef.current.contains(event.target)) {
//         setIsLanguageOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside, { passive: true });
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   if (loading) {
//     return (
//       <div className="border-b h-14 flex items-center justify-between px-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white">
//         <div>Loading...</div>
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     navigate("/login", { replace: true });
//     return null;
//   }

//   return (
//     <div className="border-b h-14 flex items-center justify-between px-2 sm:px-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white transition-colors duration-300">
//       {/* Left Section - Menu Trigger and Search */}
//       <div className="flex items-center space-x-2 sm:space-x-4">
//         {/* Mobile Menu Trigger */}
//         <button
//           onClick={onMenuToggle}
//           className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-300 lg:hidden flex-shrink-0"
//           aria-label="Toggle menu"
//         >
//           <IoIosMenu className="w-5 h-5 sm:w-6 sm:h-6" />
//         </button>

//         {/* Search Bar */}
//         <div className="relative flex-1 sm:flex-none">
//           <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 sm:w-5 sm:h-5" />
//           <input
//             type="search"
//             placeholder="Search..."
//             value={searchQuery}
//             onChange={handleSearch}
//             onKeyDown={(e) => e.key === "Enter" && performSearch()}
//             className="text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 px-4 py-2 rounded-md border pl-10 pr-4 w-full sm:w-64 bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-200 dark:border-gray-600 transition-colors duration-300"
//             aria-label="Search"
//           />
//         </div>
//       </div>

//       {/* Right Section - Actions and Profile */}
//       <div className="flex items-center space-x-1 sm:space-x-4">
//         <button 
//           onClick={toggleTheme} 
//           className="p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-300 flex-shrink-0" 
//           aria-label="Theme Toggle"
//         >
//           {theme === "light" ? 
//             <MdOutlineLightMode className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" /> : 
//             <MdOutlineDarkMode className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
//           }
//         </button>
        
//         <div className="relative" ref={languageRef}>
//           <button 
//             onClick={toggleLanguageMenu} 
//             className="p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full flex items-center space-x-1 transition-colors duration-300 flex-shrink-0" 
//             aria-label="Language Selector"
//           >
//             <span className="text-xs sm:text-sm font-medium">{language}</span>
//             <BsChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
//           </button>
//           {isLanguageOpen && (
//             <div className="absolute right-0 top-full mt-2 w-32 rounded-md shadow-lg py-1 z-50 bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600 overflow-y-auto max-h-[80vh]">
//               {["EN", "SW"].map((lang) => (
//                 <button
//                   key={lang}
//                   onClick={() => changeLanguage(lang)}
//                   className={`block w-full text-left px-4 py-2 text-sm ${language === lang ? 
//                     "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-semibold" : 
//                     "hover:bg-gray-100 dark:hover:bg-gray-600"
//                   } transition-colors duration-300`}
//                 >
//                   {lang === "EN" ? "English" : "Swahili"}
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
        
//         <div className="relative" ref={notificationsRef}>
//           <button 
//             onClick={toggleNotifications} 
//             className="p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full relative transition-colors duration-300 flex-shrink-0" 
//             aria-label="Notifications"
//           >
//             <LuBellRing className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-gray-400" />
//             {notificationCount > 0 && (
//               <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
//                 {notificationCount}
//               </span>
//             )}
//           </button>
//           {isNotificationsOpen && (
//             <div className="absolute right-0 top-full mt-2 w-64 rounded-md shadow-lg py-1 z-50 bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600 overflow-y-auto max-h-[80vh]">
//               <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
//                 <p className="text-sm font-medium">Notifications</p>
//               </div>
//               <ul className="py-1">
//                 <li className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300">
//                   No new notifications
//                 </li>
//               </ul>
//             </div>
//           )}
//         </div>
        
//         <button className="p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-300 flex-shrink-0" aria-label="Help">
//           <FiHelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-gray-400" />
//         </button>
        
//         <div className="relative flex items-center space-x-1 sm:space-x-2" ref={profileRef}>
//           <span className="text-sm font-medium hidden md:block">{userDetails.name || "User"}</span>
//           <button
//             onClick={toggleProfile}
//             className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300 flex-shrink-0"
//             aria-expanded={isProfileOpen}
//             aria-label="User menu"
//           >
//             {userDetails.profilePic ? (
//               <img
//                 src={userDetails.profilePic}
//                 alt="Profile"
//                 className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
//                 onError={(e) => {
//                   e.target.src = avatar;
//                 }}
//               />
//             ) : (
//               <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
//                 <span className="text-gray-600 dark:text-gray-300 text-base sm:text-lg font-semibold">
//                   {(userDetails.name || "U").charAt(0)}
//                 </span>
//               </div>
//             )}
//             <BsChevronDown className={`transition-transform duration-300 ${isProfileOpen && "rotate-180"} w-3 h-3 sm:w-4 sm:h-4`} />
//           </button>
//           {isProfileOpen && (
//             <div className="absolute right-0 top-full mt-2 w-64 rounded-md shadow-lg py-1 z-50 bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600 overflow-y-auto max-h-[80vh]">
//               <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
//                 <p className="text-sm font-medium">{userDetails.name || "User"}</p>
//                 <p className="text-sm text-gray-500 dark:text-gray-400">{userDetails.email || "No email"}</p>
//               </div>
//               <ul className="py-1">
//                 <li>
//                   <NavLink
//                     to="/dashboard/account/profile"
//                     className={({ isActive }) => `px-4 py-2 text-sm flex gap-2 items-center ${isActive ? 
//                       "bg-gray-200 dark:bg-gray-600" : 
//                       "hover:bg-gray-100 dark:hover:bg-gray-600"
//                     } transition-colors duration-300`}
//                   >
//                     <LuUser className="w-5 h-5 text-gray-500 dark:text-gray-400" />
//                     Profile
//                   </NavLink>
//                 </li>
//                 <li>
//                   <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm flex gap-2 items-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300">
//                     <TbLogout2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
//                     Log Out
//                   </button>
//                 </li>
//               </ul>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TopBar;






import { IoIosSearch, IoIosMenu } from "react-icons/io";
import { LuBellRing, LuUser } from "react-icons/lu";
import { BsChevronDown } from "react-icons/bs";
import { TbLogout2 } from "react-icons/tb";
import { FiHelpCircle } from "react-icons/fi";
import { MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md";
import avatar from "../assets/avatar.png";
import { useState, useEffect, useRef, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext"; 

const TopBar = ({ onMenuToggle }) => {
  const { isAuthenticated, userDetails, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [language, setLanguage] = useState("EN");
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const languageRef = useRef(null);

  // Theme-based background classes
  const containerClass = theme === "dark" 
    ? "bg-gradient-to-br from-gray-900 to-indigo-900 text-white border-gray-700" 
    : "bg-white text-gray-800 border-gray-200";

  const dropdownClass = theme === "dark"
    ? "bg-gray-800/80 backdrop-blur-md text-white border-gray-600"
    : "bg-white text-gray-800 border-gray-200";

  const buttonHoverClass = theme === "dark"
    ? "hover:bg-gray-800/50"
    : "hover:bg-gray-100";

  const inputClass = theme === "dark"
    ? "bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
    : "bg-white border-gray-300 text-gray-800 placeholder-gray-500";

  const handleLogout = useCallback(() => {
    logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const performSearch = useCallback(() => {
    console.log("Search for:", searchQuery);
  }, [searchQuery]);

  const toggleProfile = useCallback(() => {
    setIsProfileOpen(prev => !prev);
  }, []);

  const toggleLanguageMenu = useCallback(() => {
    setIsLanguageOpen(prev => !prev);
  }, []);

  const changeLanguage = useCallback((lang) => {
    setLanguage(lang);
    setIsLanguageOpen(false);
  }, []);

  const toggleNotifications = useCallback(() => {
    setIsNotificationsOpen(prev => !prev);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target)) {
        setIsLanguageOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (loading) {
    return (
      <div className={`border-b h-14 flex items-center justify-between px-4 transition-colors duration-300 ${containerClass}`}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <div className={`border-b h-14 flex items-center justify-between px-2 sm:px-4 transition-colors duration-300 ${containerClass}`}>
      {/* Left Section - Menu Trigger and Search */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Mobile Menu Trigger */}
        <button
          onClick={onMenuToggle}
          className={`p-2 rounded-full transition-colors duration-300 lg:hidden flex-shrink-0 ${buttonHoverClass}`}
          aria-label="Toggle menu"
        >
          <IoIosMenu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Search Bar */}
        <div className="relative flex-1 sm:flex-none">
          <IoIosSearch className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`} />
          <input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearch}
            onKeyDown={(e) => e.key === "Enter" && performSearch()}
            className={`text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 px-4 py-2 rounded-md border pl-10 pr-4 w-full sm:w-64 transition-colors duration-300 ${inputClass}`}
            aria-label="Search"
          />
        </div>
      </div>

      {/* Right Section - Actions and Profile */}
      <div className="flex items-center space-x-1 sm:space-x-4">
        <button 
          onClick={toggleTheme} 
          className={`p-1 sm:p-2 rounded-full transition-colors duration-300 flex-shrink-0 ${buttonHoverClass}`} 
          aria-label="Theme Toggle"
        >
          {theme === "light" ? 
            <MdOutlineLightMode className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" /> : 
            <MdOutlineDarkMode className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
          }
        </button>
        
        <div className="relative" ref={languageRef}>
          <button 
            onClick={toggleLanguageMenu} 
            className={`p-1 sm:p-2 rounded-full flex items-center space-x-1 transition-colors duration-300 flex-shrink-0 ${buttonHoverClass}`} 
            aria-label="Language Selector"
          >
            <span className="text-xs sm:text-sm font-medium">{language}</span>
            <BsChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          {isLanguageOpen && (
            <div className={`absolute right-0 top-full mt-2 w-32 rounded-md shadow-lg py-1 z-50 border overflow-y-auto max-h-[80vh] backdrop-blur-md ${dropdownClass}`}>
              {["EN", "SW"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => changeLanguage(lang)}
                  className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-300 ${
                    language === lang 
                      ? theme === "dark"
                        ? "bg-blue-900/50 text-blue-200 font-semibold"
                        : "bg-blue-100 text-blue-700 font-semibold"
                      : theme === "dark"
                      ? "hover:bg-gray-700/50"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {lang === "EN" ? "English" : "Swahili"}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={toggleNotifications} 
            className={`p-1 sm:p-2 rounded-full relative transition-colors duration-300 flex-shrink-0 ${buttonHoverClass}`} 
            aria-label="Notifications"
          >
            <LuBellRing className={`w-5 h-5 sm:w-6 sm:h-6 ${
              theme === "dark" ? "text-gray-400" : "text-gray-500"
            }`} />
            {notificationCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>
          {isNotificationsOpen && (
            <div className={`absolute right-0 top-full mt-2 w-64 rounded-md shadow-lg py-1 z-50 border overflow-y-auto max-h-[80vh] backdrop-blur-md ${dropdownClass}`}>
              <div className={`px-4 py-3 border-b ${
                theme === "dark" ? "border-gray-600" : "border-gray-200"
              }`}>
                <p className="text-sm font-medium">Notifications</p>
              </div>
              <ul className="py-1">
                <li className={`px-4 py-2 text-sm transition-colors duration-300 ${
                  theme === "dark" ? "hover:bg-gray-700/50" : "hover:bg-gray-100"
                }`}>
                  No new notifications
                </li>
              </ul>
            </div>
          )}
        </div>
        
        <button className={`p-1 sm:p-2 rounded-full transition-colors duration-300 flex-shrink-0 ${buttonHoverClass}`} aria-label="Help">
          <FiHelpCircle className={`w-5 h-5 sm:w-6 sm:h-6 ${
            theme === "dark" ? "text-gray-400" : "text-gray-500"
          }`} />
        </button>
        
        <div className="relative flex items-center space-x-1 sm:space-x-2" ref={profileRef}>
          <span className="text-sm font-medium hidden md:block">{userDetails.name || "User"}</span>
          <button
            onClick={toggleProfile}
            className={`flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2 rounded-lg transition-colors duration-300 flex-shrink-0 ${buttonHoverClass}`}
            aria-expanded={isProfileOpen}
            aria-label="User menu"
          >
            {userDetails.profilePic ? (
              <img
                src={userDetails.profilePic}
                alt="Profile"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = avatar;
                }}
              />
            ) : (
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                theme === "dark" ? "bg-gray-700" : "bg-gray-300"
              }`}>
                <span className={`text-base sm:text-lg font-semibold ${
                  theme === "dark" ? "text-gray-300" : "text-gray-600"
                }`}>
                  {(userDetails.name || "U").charAt(0)}
                </span>
              </div>
            )}
            <BsChevronDown className={`transition-transform duration-300 ${isProfileOpen && "rotate-180"} w-3 h-3 sm:w-4 sm:h-4`} />
          </button>
          {isProfileOpen && (
            <div className={`absolute right-0 top-full mt-2 w-64 rounded-md shadow-lg py-1 z-50 border overflow-y-auto max-h-[80vh] backdrop-blur-md ${dropdownClass}`}>
              <div className={`px-4 py-3 border-b ${
                theme === "dark" ? "border-gray-600" : "border-gray-200"
              }`}>
                <p className="text-sm font-medium">{userDetails.name || "User"}</p>
                <p className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}>{userDetails.email || "No email"}</p>
              </div>
              <ul className="py-1">
                <li>
                  <NavLink
                    to="/dashboard/account/profile"
                    className={({ isActive }) => `px-4 py-2 text-sm flex gap-2 items-center transition-colors duration-300 ${
                      isActive 
                        ? theme === "dark" 
                          ? "bg-gray-700/50" 
                          : "bg-gray-200"
                        : theme === "dark"
                        ? "hover:bg-gray-700/50"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <LuUser className={`w-5 h-5 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`} />
                    Profile
                  </NavLink>
                </li>
                <li>
                  <button onClick={handleLogout} className={`w-full text-left px-4 py-2 text-sm flex gap-2 items-center transition-colors duration-300 ${
                    theme === "dark" ? "hover:bg-gray-700/50" : "hover:bg-gray-100"
                  }`}>
                    <TbLogout2 className={`w-5 h-5 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`} />
                    Log Out
                  </button>
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