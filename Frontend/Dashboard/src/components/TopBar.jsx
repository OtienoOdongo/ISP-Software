
// import { IoIosSearch } from "react-icons/io";
// import { LuBellRing, LuUser } from "react-icons/lu";
// import { BsChevronDown } from "react-icons/bs";
// import { CiSettings } from "react-icons/ci";
// import { TbLogout2 } from "react-icons/tb";
// import { FiHelpCircle } from "react-icons/fi";
// import { MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md";
// import avatar from "../assets/avatar.png";
// import { useState, useEffect, useRef } from "react";
// import { NavLink } from "react-router-dom";

// const TopBar = () => {
//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const [isLanguageOpen, setIsLanguageOpen] = useState(false);
//   const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [notificationCount, setNotificationCount] = useState(5);
//   const [themeIcon, setThemeIcon] = useState("light"); // "light" or "dark"
//   const [language, setLanguage] = useState("EN");

//   const user = {
//     name: "Fridah Auma",
//     profilePic: "",
//     email: "mildredauma@gmail.com",
//   };

//   const profileRef = useRef(null);
//   const notificationsRef = useRef(null);

//   const handleSearch = (e) => {
//     setSearchQuery(e.target.value);
//   };

//   const performSearch = () => {
//     console.log("Search for:", searchQuery);
//     // Here you'd typically dispatch an action or update a search context
//   };

//   const toggleProfile = () => {
//     setIsProfileOpen(!isProfileOpen);
//   };

//   const toggleLanguageMenu = () => {
//     setIsLanguageOpen(!isLanguageOpen);
//   };

//   const changeLanguage = (lang) => {
//     setLanguage(lang);
//     setIsLanguageOpen(false); // Close the dropdown after selection
//   };

//   const toggleTheme = () => {
//     setThemeIcon(prevTheme => (prevTheme === "light" ? "dark" : "light"));
//     // Toggle the theme in your app's context or store here
//   };

//   const toggleNotifications = () => {
//     setIsNotificationsOpen(!isNotificationsOpen);
//   };

//   // Effect to handle clicks outside of the profile menu or notifications
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (profileRef.current && !profileRef.current.contains(event.target)) {
//         setIsProfileOpen(false);
//       }
//       if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
//         setIsNotificationsOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   return (
//     <div className="border-b h-14 flex items-center justify-between px-4 bg-white text-gray-800">
//       {/* Search Section */}
//       <div className="relative">
//         <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
//         <input
//           type="search"
//           placeholder="Search..."
//           value={searchQuery}
//           onChange={handleSearch}
//           onKeyPress={(e) => e.key === 'Enter' && performSearch()}
//           className="text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 px-4 py-2 rounded-md border border-gray-200 pl-10 pr-4 w-64"
//           aria-label="Search"
//         />
//       </div>

//       {/* Right Section */}
//       <div className="flex items-center space-x-4">
//         {/* Theme Toggle */}
//         <button
//           onClick={toggleTheme}
//           className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//           aria-label="Theme Toggle"
//         >
//           {themeIcon === "light" ? (
//             <MdOutlineLightMode className="w-6 h-6 text-yellow-500" />
//           ) : (
//             <MdOutlineDarkMode className="w-6 h-6 text-gray-700" />
//           )}
//         </button>

//         {/* Language Selector */}
//         <div className="relative">
//           <button
//             onClick={toggleLanguageMenu}
//             className="p-2 hover:bg-gray-100 rounded-full flex items-center space-x-1"
//             aria-label="Language Selector"
//           >
//             <span className="text-sm font-medium">{language}</span>
//             <BsChevronDown className="w-4 h-4" />
//           </button>
//           {isLanguageOpen && (
//             <div className="absolute right-0 top-10 w-32 bg-white rounded-md shadow-lg py-1 z-50">
//               {["EN", "SW"].map((lang) => (
//                 <button
//                   key={lang}
//                   onClick={() => changeLanguage(lang)}
//                   className={`block px-4 py-2 text-sm ${language === lang
//                     ? "bg-gray-100 text-blue-500 font-semibold"
//                     : "hover:bg-gray-100"
//                     }`}
//                 >
//                   {lang === "EN" ? "English" : "Swahili"}
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Notifications */}
//         <div className="relative" ref={notificationsRef}>
//           <button
//             onClick={toggleNotifications}
//             className="p-2 hover:bg-gray-100 rounded-full relative"
//             aria-label="Notifications"
//           >
//             <LuBellRing className="w-6 h-6 text-gray-500" />
//             {notificationCount > 0 && (
//               <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
//                 {notificationCount}
//               </span>
//             )}
//           </button>

//           {isNotificationsOpen && (
//             <div className="absolute right-0 top-14 w-64 bg-white rounded-md shadow-lg py-1 z-50">
//               {/* Notification items here */}
//               <div className="px-4 py-3 border-b">
//                 <p className="text-sm font-medium">Notifications</p>
//               </div>
//               <ul className="py-1">
//                 <li className="px-4 py-2 text-sm hover:bg-gray-100">Notification 1</li>
//                 <li className="px-4 py-2 text-sm hover:bg-gray-100">Notification 2</li>
//                 {/* Add more notifications here */}
//               </ul>
//             </div>
//           )}
//         </div>

//         {/* Help */}
//         <button
//           className="p-2 hover:bg-gray-100 rounded-full"
//           aria-label="Help"
//         >
//           <FiHelpCircle className="w-6 h-6 text-gray-500" />
//         </button>

//         {/* User Profile */}
//         <div className="relative flex items-center space-x-2" ref={profileRef}>
//           <span className="text-sm font-medium">{user.name}</span>
//           <button
//             onClick={toggleProfile}
//             className="flex items-center space-x-2 p-2 rounded-lg"
//             aria-expanded={isProfileOpen}
//             aria-label="User menu"
//           >
//             {user.profilePic ? (
//               <img
//                 src={user.profilePic}
//                 alt="Profile"
//                 className="w-10 h-10 rounded-full object-cover"
//                 onError={(e) => {
//                   e.target.src = avatar;
//                 }}
//               />
//             ) : (
//               <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
//                 <span className="text-gray-600 text-lg font-semibold">
//                   {user.name.charAt(0)}
//                 </span>
//               </div>
//             )}
//             <BsChevronDown className={`${isProfileOpen && "rotate-180"}`} />
//           </button>

//           {/* Profile Dropdown */}
//           {isProfileOpen && (
//             <div className="absolute right-0 top-14 w-64 bg-white rounded-md shadow-lg py-1 z-50">
//               <div className="px-4 py-3 border-b">
//                 <p className="text-sm font-medium">{user.name}</p>
//                 <p className="text-sm text-gray-500">{user.email}</p>
//               </div>
//               <ul className="py-1">
//                 <li>
//                   <NavLink
//                     to="account/admin-profile"
//                     className={({ isActive }) =>
//                       `px-4 py-2 text-sm flex gap-2 ${isActive ? "bg-gray-200" : "hover:bg-gray-100"}`
//                     }
//                   >
//                     <LuUser className="w-6 h-6 text-gray-500" />
//                     Profile
//                   </NavLink>
//                 </li>
//                 <li>
//                   <NavLink
//                     to="account/settings"
//                     className={({ isActive }) =>
//                       `px-4 py-2 text-sm flex gap-2 ${isActive ? "bg-gray-200" : "hover:bg-gray-100"}`
//                     }
//                   >
//                     <CiSettings className="w-6 h-6 text-gray-500" />
//                     Settings
//                   </NavLink>
//                 </li>
//                 <li>
//                   <a
//                     href="/logout"
//                     className="px-4 py-2 text-sm flex gap-2 hover:bg-gray-100"
//                   >
//                     <TbLogout2 className="w-6 h-6 text-gray-500" />
//                     Log Out
//                   </a>
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




import { IoIosSearch } from "react-icons/io";
import { LuBellRing, LuUser } from "react-icons/lu";
import { BsChevronDown } from "react-icons/bs";
import { CiSettings } from "react-icons/ci";
import { TbLogout2 } from "react-icons/tb";
import { FiHelpCircle } from "react-icons/fi";
import { MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md";
import avatar from "../assets/avatar.png";
import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../context/AuthContext";

const TopBar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [themeIcon, setThemeIcon] = useState("light");
  const [language, setLanguage] = useState("EN");
  const [user, setUser] = useState({ name: "", email: "", profilePic: "" });
  const [loading, setLoading] = useState(true);

  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get("/api/auth/users/me/");
        console.log("User data:", response.data); // Debug response
        setUser({
          name: response.data.name || response.data.username || "User", // Fallback to username
          email: response.data.email || "",
          profilePic: response.data.profilePic || "", // Adjust if field differs
        });
      } catch (error) {
        console.error("Failed to fetch user details:", error.response?.status, error.response?.data);
        setUser({ name: "Unknown User", email: "", profilePic: "" }); // Better fallback
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const performSearch = () => {
    console.log("Search for:", searchQuery);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const toggleLanguageMenu = () => {
    setIsLanguageOpen(!isLanguageOpen);
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    setIsLanguageOpen(false);
  };

  const toggleTheme = () => {
    setThemeIcon((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isAuthenticated && !loading) {
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <div className="border-b h-14 flex items-center justify-between px-4 bg-white text-gray-800">
      <div className="relative">
        <IoIosSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
        <input
          type="search"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearch}
          onKeyDown={(e) => e.key === "Enter" && performSearch()}
          className="text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 px-4 py-2 rounded-md border border-gray-200 pl-10 pr-4 w-64"
          aria-label="Search"
        />
      </div>
      <div className="flex items-center space-x-4">
        <button onClick={toggleTheme} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Theme Toggle">
          {themeIcon === "light" ? <MdOutlineLightMode className="w-6 h-6 text-yellow-500" /> : <MdOutlineDarkMode className="w-6 h-6 text-gray-700" />}
        </button>
        <div className="relative">
          <button onClick={toggleLanguageMenu} className="p-2 hover:bg-gray-100 rounded-full flex items-center space-x-1" aria-label="Language Selector">
            <span className="text-sm font-medium">{language}</span>
            <BsChevronDown className="w-4 h-4" />
          </button>
          {isLanguageOpen && (
            <div className="absolute right-0 top-10 w-32 bg-white rounded-md shadow-lg py-1 z-50">
              {["EN", "SW"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => changeLanguage(lang)}
                  className={`block px-4 py-2 text-sm ${language === lang ? "bg-gray-100 text-blue-500 font-semibold" : "hover:bg-gray-100"}`}
                >
                  {lang === "EN" ? "English" : "Swahili"}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="relative" ref={notificationsRef}>
          <button onClick={toggleNotifications} className="p-2 hover:bg-gray-100 rounded-full relative" aria-label="Notifications">
            <LuBellRing className="w-6 h-6 text-gray-500" />
            {notificationCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>
          {isNotificationsOpen && (
            <div className="absolute right-0 top-14 w-64 bg-white rounded-md shadow-lg py-1 z-50">
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-medium">Notifications</p>
              </div>
              <ul className="py-1">
                <li className="px-4 py-2 text-sm hover:bg-gray-100">No new notifications</li>
              </ul>
            </div>
          )}
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-full" aria-label="Help">
          <FiHelpCircle className="w-6 h-6 text-gray-500" />
        </button>
        <div className="relative flex items-center space-x-2" ref={profileRef}>
          <span className="text-sm font-medium">{loading ? "Loading..." : user.name}</span>
          <button
            onClick={toggleProfile}
            className="flex items-center space-x-2 p-2 rounded-lg"
            aria-expanded={isProfileOpen}
            aria-label="User menu"
            disabled={loading}
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
                <span className="text-gray-600 text-lg font-semibold">{loading ? "?" : user.name.charAt(0)}</span>
              </div>
            )}
            <BsChevronDown className={`${isProfileOpen && "rotate-180"}`} />
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 top-14 w-64 bg-white rounded-md shadow-lg py-1 z-50">
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <ul className="py-1">
                <li>
                  <NavLink
                    to="/dashboard/account/admin-profile"
                    className={({ isActive }) => `px-4 py-2 text-sm flex gap-2 ${isActive ? "bg-gray-200" : "hover:bg-gray-100"}`}
                  >
                    <LuUser className="w-6 h-6 text-gray-500" />
                    Profile
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/account/settings"
                    className={({ isActive }) => `px-4 py-2 text-sm flex gap-2 ${isActive ? "bg-gray-200" : "hover:bg-gray-100"}`}
                  >
                    <CiSettings className="w-6 h-6 text-gray-500" />
                    Settings
                  </NavLink>
                </li>
                <li>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm flex gap-2 hover:bg-gray-100">
                    <TbLogout2 className="w-6 h-6 text-gray-500" />
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