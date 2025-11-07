
import React, { useState, useCallback, useEffect, useMemo } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { BsArrowLeftCircle } from "react-icons/bs";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { menuItems } from "../constants/index.jsx";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext"; 
import dicondenlogo from "../assets/dicondenlogo.png";

const SideBar = ({ onMobileMenuClose, isMobileMenuOpen }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Theme-based container styles
  const containerClass =
    theme === "dark"
      ? "bg-gray-900 text-white border-gray-700"
      : "bg-white text-gray-800 border-gray-200";

  // Generate path for submenu routes
  const generatePath = useCallback((menuTitle, submenuTitle) => {
    if (menuTitle === "Dashboard") return "/dashboard";
    const slugify = (str) =>
      str.toLowerCase().replace(/[\s&]+/g, "-").replace(/-+/g, "-");
    return `/dashboard/${slugify(menuTitle)}/${slugify(submenuTitle)}`;
  }, []);

  // Map submenu paths to parent indexes
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

  // Detect active menu based on route
  useEffect(() => {
    const currentPath = location.pathname;
    if (menuIndexMap.has(currentPath)) {
      setActiveMenuIndex(menuIndexMap.get(currentPath));
    } else {
      setActiveMenuIndex(null);
    }
  }, [location.pathname, menuIndexMap]);

  // Handle responsive view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsExpanded(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle menu expansion toggle
  const handleMenuClick = useCallback((index) => {
    setActiveMenuIndex((prevIndex) => (prevIndex === index ? null : index));
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    logout?.();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  // Handle logo click (go to dashboard)
  const handleLogoClick = useCallback(() => {
    navigate("/dashboard");
    if (isMobile) onMobileMenuClose?.();
  }, [navigate, isMobile, onMobileMenuClose]);

  // Sidebar toggle button (desktop)
  const toggleSidebar = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Close mobile menu when navigating
  const handleNavLinkClick = useCallback(() => {
    if (isMobile) onMobileMenuClose?.();
  }, [isMobile, onMobileMenuClose]);

  // Custom isActive function for Dashboard - only active on exact /dashboard
  const isDashboardActive = useCallback(({ isActive }) => {
    // Only return true if we're exactly on /dashboard
    return location.pathname === '/dashboard';
  }, [location.pathname]);

  return (
    <nav
      className={`h-screen border-r p-5 pt-8 transition-all duration-300 ${containerClass} ${
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
        className={`absolute -right-3 top-9 ${
          theme === "dark"
            ? "text-gray-300 hover:text-white bg-gray-800 border-gray-600"
            : "text-gray-600 hover:text-gray-900 bg-white border-gray-200"
        } rounded-full shadow p-1 border transition-colors duration-300 ${
          isMobile ? "hidden" : "block"
        }`}
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
          className={`absolute top-4 right-4 ${
            theme === "dark"
              ? "text-gray-300 hover:text-white bg-gray-800 border-gray-600"
              : "text-gray-600 hover:text-gray-900 bg-white border-gray-200"
          } rounded-full shadow p-1 border transition-colors duration-300`}
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
          className={`text-xl font-semibold tracking-tight transition-all duration-300 ${
            !isExpanded && "scale-0"
          } ${theme === "dark" ? "text-white" : "text-gray-800"}`}
        >
          Diconden
        </span>
      </div>

      {/* Menu Items */}
      <ul className="pt-8 space-y-1">
        {menuItems.map((menu, index) => (
          <div key={`menu-${index}`}>
            {/* Dashboard Link */}
            {menu.title === "Dashboard" ? (
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `relative flex items-center gap-3 p-2.5 rounded-md text-xs font-medium transition-colors duration-300 ${
                    // Use custom active check instead of React Router's isActive
                    location.pathname === '/dashboard'
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow"
                      : `${
                          theme === "dark"
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-600 hover:bg-indigo-100"
                        }`
                  }`
                }
                onClick={handleNavLinkClick}
              >
                {React.cloneElement(menu.icon, {
                  className: `h-5 w-5 ${
                    location.pathname === "/dashboard"
                      ? "text-white"
                      : theme === "dark"
                      ? "text-gray-300"
                      : "text-gray-600"
                  }`,
                })}

                {isExpanded && (
                  <span className="text-xs font-bold">{menu.title}</span>
                )}

                {/* Active Dot for Dashboard */}
                {location.pathname === "/dashboard" && (
                  <span
                    className={`absolute right-6 top-1/2 transform -translate-y-1/2 w-2.5 h-2.5 rounded-full ${
                      theme === "dark" ? "bg-indigo-600" : "bg-indigi-400"
                    }`}
                  />
                )}
              </NavLink>
            ) : menu.title === "Logout" ? (
              /* Logout Button */
              <li
                onClick={handleLogout}
                className={`flex items-center gap-3 p-2.5 rounded-md cursor-pointer transition-colors duration-300 ${
                  theme === "dark"
                    ? "text-gray-300 hover:bg-red-900/50 hover:text-red-300"
                    : "text-gray-600 hover:bg-red-100 hover:text-red-700"
                }`}
              >
                {menu.icon}
                {isExpanded && (
                  <span className="text-xs font-bold">{menu.title}</span>
                )}
              </li>
            ) : (
              <>
                {/* Parent Menu */}
                <li
                  className={`relative flex items-center justify-between p-2.5 rounded-md text-xs font-bold cursor-pointer transition-colors duration-300 ${
                    activeMenuIndex === index
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow"
                      : `${
                          theme === "dark"
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-600 hover:bg-indigo-100"
                        }`
                  }`}
                  onClick={() => handleMenuClick(index)}
                >
                  <div className="flex items-center gap-3">
                    {React.cloneElement(menu.icon, {
                      className: `h-5 w-5 ${
                        activeMenuIndex === index
                          ? "text-white"
                          : theme === "dark"
                          ? "text-gray-300"
                          : "text-gray-600"
                      }`,
                    })}
                    {isExpanded && <span className="text-xs">{menu.title}</span>}
                  </div>

                  {/* Active Dot (submenus) */}
                  {activeMenuIndex === index && (
                    <span
                      className={`absolute right-6 top-1/2 transform -translate-y-1/2 w-2.5 h-2.5 rounded-full ${
                        theme === "dark" ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]"
                         : "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]"
                      }`}
                    />
                  )}

                  {/* Dropdown Icon */}
                  {menu.submenuItems && (
                    <ChevronDownIcon
                      className={`w-4 h-4 transform transition-transform duration-300 
                        ${
                          activeMenuIndex === index
                            ? "rotate-0"
                            : "rotate-[-90deg]"
                        } 
                        ${!isExpanded && "hidden"} ${
                        activeMenuIndex === index
                          ? "text-white"
                          : theme === "dark"
                          ? "text-indigo-400"
                          : "text-indigo-600"
                      }`}
                    />
                  )}
                </li>

                {/* Submenu Items */}
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
                                ? theme === "dark"
                                  ? "text-white font-medium bg-gray-700"
                                  : "text-gray-800 font-medium bg-gray-100"
                                : theme === "dark"
                                ? "text-gray-400 hover:bg-gray-700 hover:text-white"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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