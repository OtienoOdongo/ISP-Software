// import { useState, useCallback } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import { BsArrowLeftCircle } from "react-icons/bs";
// import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
// import { menuItems } from "../constants/index.jsx";
// import { useAuth } from "../context/AuthContext";
// import dicondenlogo from "../assets/dicondenlogo.png";
// import dashboard from "../assets/dashboard.png";

// const SideBar = () => {
//   const [isExpanded, setIsExpanded] = useState(true);
//   const [activeMenuIndex, setActiveMenuIndex] = useState(null);
//   const { logout } = useAuth();
//   const navigate = useNavigate();

//   const handleMenuClick = useCallback((index) => {
//     setActiveMenuIndex(prevIndex => prevIndex === index ? null : index);
//   }, []);

//   const handleLogout = useCallback(() => {
//     logout?.();
//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("refreshToken");
//     navigate("/login", { replace: true });
//   }, [logout, navigate]);

//   const handleLogoClick = useCallback(() => {
//     navigate("/dashboard");
//     setActiveMenuIndex(null); // Close any open menus when logo is clicked
//   }, [navigate]);

//   const generatePath = (menuTitle, submenuTitle) => {
//     if (menuTitle === "Dashboard") return "/dashboard";
//     const slugify = (str) =>
//       str.toLowerCase().replace(/[\s&]+/g, "-").replace(/-+/g, "-");
//     return `/dashboard/${slugify(menuTitle)}/${slugify(submenuTitle)}`;
//   };

//   return (
//     <nav className="flex" role="navigation" aria-label="Main Navigation">
//       <div className={`h-screen border-r p-5 pt-8 bg-white transition-all duration-300 ${isExpanded ? "w-64" : "w-20"}`}>
//         {/* Toggle Button */}
//         <button
//           className="absolute -right-3 top-9 text-gray-600 hover:text-gray-900 bg-white rounded-full shadow p-1"
//           onClick={() => setIsExpanded(!isExpanded)}
//           aria-expanded={isExpanded}
//         >
//           <BsArrowLeftCircle className={`text-xl transform transition-transform ${!isExpanded && "rotate-180"}`} />
//         </button>

//         {/* Logo */}
//         <div className="inline-flex items-center cursor-pointer" onClick={handleLogoClick}>
//           <img src={dicondenlogo} alt="Diconden Logo" className={`h-10 w-10 transition-transform ${isExpanded ? "mr-2 rotate-[360deg]" : ""}`} />
//           <span className={`text-xl font-semibold tracking-tight text-gray-800 transition-all duration-300 ${!isExpanded && "scale-0"}`}>
//             Diconden
//           </span>
//         </div>

//         {/* Menu Items */}
//         <ul className="pt-8 space-y-1">
//           {menuItems.map((menu, index) => (
//             <div key={`menu-${index}`}>
//               {menu.title === "Dashboard" ? (
//                 <NavLink
//                   to="/dashboard"
//                   className={({ isActive }) =>
//                     `flex items-center gap-3 p-2.5 rounded-md text-sm font-medium ${
//                       isActive ? "text-indigo-700" : "text-gray-600"
//                     } hover:bg-indigo-50 transition-colors`
//                   }
//                   onClick={() => setActiveMenuIndex(null)} // Close any open menus when dashboard is clicked
//                 >
//                   <img src={dashboard} alt="dashboard" className="h-5 w-5" />
//                   {isExpanded && <span>{menu.title}</span>}
//                 </NavLink>
//               ) : menu.title === "Logout" ? (
//                 <li
//                   onClick={handleLogout}
//                   className="flex items-center gap-3 p-2.5 rounded-md text-gray-600 hover:bg-red-100 hover:text-red-700 cursor-pointer transition-colors"
//                 >
//                   <span>{menu.icon}</span>
//                   {isExpanded && <span className="text-sm font-medium">{menu.title}</span>}
//                 </li>
//               ) : (
//                 <>
//                   <li
//                     className={`relative flex items-center justify-between p-2.5 rounded-md text-sm cursor-pointer transition-colors ${
//                       activeMenuIndex === index
//                         ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-700"
//                         : "text-gray-600 hover:bg-indigo-50"
//                     }`}
//                     onClick={() => handleMenuClick(index)}
//                   >
//                     <div className="flex items-center gap-3">
//                       {menu.icon}
//                       {isExpanded && <span>{menu.title}</span>}
//                     </div>

//                     {/* Active Dot */}
//                     {activeMenuIndex === index && (
//                       <span className="absolute right-8 top-4 w-2 h-2 rounded-full bg-indigo-800" />
//                     )}

//                     {/* Dropdown Icon */}
//                     {menu.submenuItems && (
//                       activeMenuIndex === index ? (
//                         <ChevronDownIcon className={`w-4 h-4 text-indigo-600 ${!isExpanded && "hidden"}`} />
//                       ) : (
//                         <ChevronRightIcon className={`w-4 h-4 text-gray-500 ${!isExpanded && "hidden"}`} />
//                       )
//                     )}
//                   </li>

//                   {/* Submenu */}
//                   {menu.submenuItems && isExpanded && activeMenuIndex === index && (
//                     <ul className="ml-8 mt-1 space-y-1 transition-all duration-300">
//                       {menu.submenuItems.map((submenu, subIndex) => (
//                         <NavLink
//                           key={`submenu-${index}-${subIndex}`}
//                           to={generatePath(menu.title, submenu.title)}
//                           className={({ isActive }) =>
//                             `block text-xs px-3 py-2 rounded-md ${
//                               isActive ? "text-gray-800 font-medium" : "text-gray-600"
//                             } hover:bg-gray-100 hover:text-gray-800 transition`
//                           }
//                         >
//                           {submenu.title}
//                         </NavLink>
//                       ))}
//                     </ul>
//                   )}
//                 </>
//               )}
//             </div>
//           ))}
//         </ul>
//       </div>
//     </nav>
//   );
// };

// export default SideBar;







// import { useState, useCallback, useEffect } from "react";
// import { NavLink, useNavigate, useLocation } from "react-router-dom";
// import { BsArrowLeftCircle } from "react-icons/bs";
// import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
// import { menuItems } from "../constants/index.jsx";
// import { useAuth } from "../context/AuthContext";
// import { useTheme } from "../context/ThemeContext"; 
// import dicondenlogo from "../assets/dicondenlogo.png";
// import dashboard from "../assets/dashboard.png";

// const SideBar = () => {
//   const [isExpanded, setIsExpanded] = useState(true);
//   const [activeMenuIndex, setActiveMenuIndex] = useState(null);
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
//   const { logout } = useAuth();
//   const { theme } = useTheme();
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Efficient menu index mapping for quick lookups
//   const menuIndexMap = useCallback(() => {
//     const map = new Map();
//     menuItems.forEach((menu, index) => {
//       if (menu.submenuItems) {
//         menu.submenuItems.forEach(submenu => {
//           const path = generatePath(menu.title, submenu.title);
//           map.set(path, index);
//         });
//       }
//     });
//     return map;
//   }, []);

//   // Set active menu based on current path
//   useEffect(() => {
//     const map = menuIndexMap();
//     const currentPath = location.pathname;
    
//     if (map.has(currentPath)) {
//       setActiveMenuIndex(map.get(currentPath));
//     } else if (currentPath === "/dashboard") {
//       setActiveMenuIndex(0); // Dashboard index
//     } else {
//       setActiveMenuIndex(null);
//     }
//   }, [location.pathname, menuIndexMap]);

//   // Responsive handling
//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth < 768;
//       setIsMobile(mobile);
//       if (mobile) {
//         setIsExpanded(false);
//       } else {
//         setIsExpanded(true);
//       }
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const handleMenuClick = useCallback((index) => {
//     setActiveMenuIndex(prevIndex => prevIndex === index ? null : index);
//   }, []);

//   const handleLogout = useCallback(() => {
//     logout?.();
//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("refreshToken");
//     navigate("/login", { replace: true });
//   }, [logout, navigate]);

//   const handleLogoClick = useCallback(() => {
//     navigate("/dashboard");
//     setActiveMenuIndex(0); // Set to dashboard index
//   }, [navigate]);

//   const generatePath = useCallback((menuTitle, submenuTitle) => {
//     if (menuTitle === "Dashboard") return "/dashboard";
//     const slugify = (str) =>
//       str.toLowerCase().replace(/[\s&]+/g, "-").replace(/-+/g, "-");
//     return `/dashboard/${slugify(menuTitle)}/${slugify(submenuTitle)}`;
//   }, []);

//   return (
//     <nav className="flex" role="navigation" aria-label="Main Navigation">
//       <div 
//         className={`h-screen border-r p-5 pt-8 transition-all duration-300 ${
//           isExpanded ? "w-64" : "w-20"
//         } bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`}
//       >
//         {/* Toggle Button */}
//         <button
//           className="absolute -right-3 top-9 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-gray-700 rounded-full shadow p-1 border border-gray-200 dark:border-gray-600"
//           onClick={() => setIsExpanded(!isExpanded)}
//           aria-expanded={isExpanded}
//         >
//           <BsArrowLeftCircle className={`text-xl transform transition-transform ${!isExpanded && "rotate-180"}`} />
//         </button>

//         {/* Logo */}
//         <div className="inline-flex items-center cursor-pointer" onClick={handleLogoClick}>
//           <img 
//             src={dicondenlogo} 
//             alt="Diconden Logo" 
//             className={`h-10 w-10 transition-transform ${isExpanded ? "mr-2" : ""}`} 
//           />
//           <span className={`text-xl font-semibold tracking-tight text-gray-800 dark:text-white transition-all duration-300 ${!isExpanded && "scale-0"}`}>
//             Diconden
//           </span>
//         </div>

//         {/* Menu Items */}
//         <ul className="pt-8 space-y-1">
//           {menuItems.map((menu, index) => (
//             <div key={`menu-${index}`}>
//               {menu.title === "Dashboard" ? (
//                 <NavLink
//                   to="/dashboard"
//                   className={({ isActive }) =>
//                     `flex items-center gap-3 p-2.5 rounded-md text-sm font-medium transition-colors duration-300 ${
//                       isActive ? 
//                         "text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30" : 
//                         "text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700"
//                     }`
//                   }
//                   onClick={() => setActiveMenuIndex(0)}
//                 >
//                   <img 
//                     src={dashboard} 
//                     alt="dashboard" 
//                     className="h-5 w-5 filter dark:invert" 
//                   />
//                   {isExpanded && <span>{menu.title}</span>}
//                 </NavLink>
//               ) : menu.title === "Logout" ? (
//                 <li
//                   onClick={handleLogout}
//                   className="flex items-center gap-3 p-2.5 rounded-md text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400 cursor-pointer transition-colors duration-300"
//                 >
//                   <img 
//                     src={menu.icon.props.src} 
//                     alt={menu.title} 
//                     className="h-5 w-5 filter dark:invert" 
//                   />
//                   {isExpanded && <span className="text-sm font-medium">{menu.title}</span>}
//                 </li>
//               ) : (
//                 <>
//                   <li
//                     className={`relative flex items-center justify-between p-2.5 rounded-md text-sm cursor-pointer transition-colors duration-300 ${
//                       activeMenuIndex === index
//                         ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 dark:from-indigo-900/50 dark:to-indigo-800/50 text-indigo-700 dark:text-indigo-300"
//                         : "text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700"
//                     }`}
//                     onClick={() => handleMenuClick(index)}
//                   >
//                     <div className="flex items-center gap-3">
//                       <img 
//                         src={menu.icon.props.src} 
//                         alt={menu.title} 
//                         className="h-5 w-5 filter dark:invert" 
//                       />
//                       {isExpanded && <span>{menu.title}</span>}
//                     </div>

//                     {/* Active Dot */}
//                     {activeMenuIndex === index && (
//                       <span className="absolute right-8 top-4 w-2 h-2 rounded-full bg-indigo-800 dark:bg-indigo-400" />
//                     )}

//                     {/* Dropdown Icon */}
//                     {menu.submenuItems && (
//                       activeMenuIndex === index ? (
//                         <ChevronDownIcon className={`w-4 h-4 text-indigo-600 dark:text-indigo-400 ${!isExpanded && "hidden"}`} />
//                       ) : (
//                         <ChevronRightIcon className={`w-4 h-4 text-gray-500 dark:text-gray-400 ${!isExpanded && "hidden"}`} />
//                       )
//                     )}
//                   </li>

//                   {/* Submenu */}
//                   {menu.submenuItems && isExpanded && activeMenuIndex === index && (
//                     <ul className="ml-8 mt-1 space-y-1 transition-all duration-300">
//                       {menu.submenuItems.map((submenu, subIndex) => (
//                         <NavLink
//                           key={`submenu-${index}-${subIndex}`}
//                           to={generatePath(menu.title, submenu.title)}
//                           className={({ isActive }) =>
//                             `block text-xs px-3 py-2 rounded-md transition-colors duration-300 ${
//                               isActive ? 
//                                 "text-gray-800 dark:text-white font-medium bg-gray-100 dark:bg-gray-700" : 
//                                 "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
//                             }`
//                           }
//                         >
//                           {submenu.title}
//                         </NavLink>
//                       ))}
//                     </ul>
//                   )}
//                 </>
//               )}
//             </div>
//           ))}
//         </ul>
//       </div>
//     </nav>
//   );
// };

// export default SideBar;







import { useState, useCallback, useEffect, useMemo } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { BsArrowLeftCircle } from "react-icons/bs";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { menuItems } from "../constants/index.jsx";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext"; 
import dicondenlogo from "../assets/dicondenlogo.png";
import dashboard from "../assets/dashboard.png";

const SideBar = ({ onMobileMenuClose, isMobileMenuOpen }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const generatePath = useCallback((menuTitle, submenuTitle) => {
    if (menuTitle === "Dashboard") return "/dashboard";
    const slugify = (str) =>
      str.toLowerCase().replace(/[\s&]+/g, "-").replace(/-+/g, "-");
    return `/dashboard/${slugify(menuTitle)}/${slugify(submenuTitle)}`;
  }, []);

  const menuIndexMap = useMemo(() => {
    const map = new Map();
    menuItems.forEach((menu, index) => {
      if (menu.submenuItems) {
        menu.submenuItems.forEach((submenu) => {
          const path = generatePath(menu.title, submenu.title);
          map.set(path, index);
        });
      }
    });
    return map;
  }, [generatePath]);

  useEffect(() => {
    const currentPath = location.pathname;

    if (menuIndexMap.has(currentPath)) {
      setActiveMenuIndex(menuIndexMap.get(currentPath));
    } else if (currentPath === "/dashboard") {
      setActiveMenuIndex(0);
    } else {
      setActiveMenuIndex(null);
    }
  }, [location.pathname, menuIndexMap]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsExpanded(true); // Force expanded on mobile for usability
      }
    };

    handleResize(); // Call on mount for consistent initial state
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMenuClick = useCallback((index) => {
    setActiveMenuIndex((prevIndex) => (prevIndex === index ? null : index));
  }, []);

  const handleLogout = useCallback(() => {
    logout?.();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  const handleLogoClick = useCallback(() => {
    navigate("/dashboard");
    setActiveMenuIndex(0);
    if (isMobile) {
      onMobileMenuClose?.();
    }
  }, [navigate, isMobile, onMobileMenuClose]);

  const toggleSidebar = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleNavLinkClick = useCallback(() => {
    if (isMobile) {
      onMobileMenuClose?.();
    }
  }, [isMobile, onMobileMenuClose]);

  return (
    <nav
      className={`h-screen border-r p-5 pt-8 transition-all duration-300 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
        isExpanded ? "w-64" : "w-20"
      } ${
        isMobile
          ? `fixed left-0 top-0 z-50 transform transition-transform duration-300 ${
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            }`
          : "relative"
      }`}
      role="navigation"
      aria-label="Main Navigation"
    >
      {/* Toggle Button (desktop only) */}
      <button
        className={`absolute -right-3 top-9 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white 
          bg-white dark:bg-gray-700 rounded-full shadow p-1 border border-gray-200 dark:border-gray-600
          ${isMobile ? "hidden" : "block"}`}
        onClick={toggleSidebar}
        aria-expanded={isExpanded}
      >
        <BsArrowLeftCircle
          className={`text-xl transform transition-transform duration-300 ${
            !isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Mobile Close Button */}
      {isMobile && (
        <button
          className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white 
            bg-white dark:bg-gray-700 rounded-full shadow p-1 border border-gray-200 dark:border-gray-600"
          onClick={onMobileMenuClose}
          aria-label="Close menu"
        >
          <BsArrowLeftCircle className="text-xl" />
        </button>
      )}

      {/* Logo */}
      <div
        className="inline-flex items-center cursor-pointer"
        onClick={handleLogoClick}
      >
        <img
          src={dicondenlogo}
          alt="Diconden Logo"
          className={`h-10 w-10 transition-transform ${isExpanded ? "mr-2" : ""}`}
        />
        <span
          className={`text-xl font-semibold tracking-tight text-gray-800 dark:text-white transition-all duration-300 ${
            !isExpanded && "scale-0"
          }`}
        >
          Diconden
        </span>
      </div>

      {/* Menu Items */}
      <ul className="pt-8 space-y-1">
        {menuItems.map((menu, index) => (
          <div key={`menu-${index}`}>
            {menu.title === "Dashboard" ? (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-3 p-2.5 rounded-md text-sm font-medium transition-colors duration-300 ${
                    isActive
                      ? "text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                      : "text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700"
                  }`
                }
                onClick={() => {
                  setActiveMenuIndex(0);
                  handleNavLinkClick();
                }}
              >
                <img
                  src={dashboard}
                  alt="dashboard"
                  className="h-5 w-5 filter dark:invert"
                />
                {isExpanded && <span>{menu.title}</span>}
              </NavLink>
            ) : menu.title === "Logout" ? (
              <li
                onClick={handleLogout}
                className="flex items-center gap-3 p-2.5 rounded-md text-gray-600 dark:text-gray-300 
                  hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-400 
                  cursor-pointer transition-colors duration-300"
              >
                <img
                  src={menu.icon.props.src}
                  alt={menu.title}
                  className="h-5 w-5 filter dark:invert"
                />
                {isExpanded && (
                  <span className="text-sm font-medium">{menu.title}</span>
                )}
              </li>
            ) : (
              <>
                <li
                  className={`relative flex items-center justify-between p-2.5 rounded-md text-sm cursor-pointer 
                    transition-colors duration-300 ${
                      activeMenuIndex === index
                        ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 dark:from-indigo-900/50 dark:to-indigo-800/50 text-indigo-700 dark:text-indigo-300"
                        : "text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700"
                    }`}
                  onClick={() => handleMenuClick(index)}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={menu.icon.props.src}
                      alt={menu.title}
                      className="h-5 w-5 filter dark:invert"
                    />
                    {isExpanded && <span>{menu.title}</span>}
                  </div>

                  {/* Active Dot */}
                  {activeMenuIndex === index && (
                    <span className="absolute right-8 top-4 w-2 h-2 rounded-full bg-indigo-800 dark:bg-indigo-400" />
                  )}

                  {/* Dropdown Icon (single icon with rotation) */}
                  {menu.submenuItems && (
                    <ChevronDownIcon
                      className={`w-4 h-4 text-indigo-600 dark:text-indigo-400 transform transition-transform duration-300 
                        ${activeMenuIndex === index ? "rotate-0" : "rotate-[-90deg]"} 
                        ${!isExpanded && "hidden"}`}
                    />
                  )}
                </li>

                {/* Submenu */}
                {menu.submenuItems &&
                  isExpanded &&
                  activeMenuIndex === index && (
                    <ul className="ml-8 mt-1 space-y-1 transition-all duration-300">
                      {menu.submenuItems.map((submenu, subIndex) => (
                        <NavLink
                          key={`submenu-${index}-${subIndex}`}
                          to={generatePath(menu.title, submenu.title)}
                          className={({ isActive }) =>
                            `block text-xs px-3 py-2 rounded-md transition-colors duration-300 ${
                              isActive
                                ? "text-gray-800 dark:text-white font-medium bg-gray-100 dark:bg-gray-700"
                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`
                          }
                          onClick={handleNavLinkClick}
                        >
                          {submenu.title}
                        </NavLink>
                      ))}
                    </ul>
                  )}
              </>
            )}
          </div>
        ))}
      </ul>
    </nav>
  );
};

export default SideBar;