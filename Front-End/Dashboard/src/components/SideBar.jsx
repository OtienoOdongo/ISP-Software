
import { useState, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { BsArrowLeftCircle, BsChevronDown } from "react-icons/bs";
import { BiSolidDashboard } from "react-icons/bi";
import { menuItems } from "../constants/index.jsx";
import logo from "../assets/logo.png";

const SideBar = () => {
  // Sidebar open/close state
  const [isExpanded, setIsExpanded] = useState(true);

  // Track which menu is expanded for showing submenus
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);

  // Toggles the open/close state of a specific menu item
  const handleMenuClick = useCallback(
    (index) => {
      setActiveMenuIndex(activeMenuIndex === index ? null : index);
    },
    [activeMenuIndex]
  );

  // Utility function to create dynamic paths for submenus
  const generatePath = (menuTitle, submenuTitle) => (
    `/${menuTitle.toLowerCase().replace(/\s+/g, '-')}/${submenuTitle.toLowerCase().replace(/\s+/g, '-')}`
  );

  return (
    <nav className="flex" role="navigation" aria-label="Main Navigation">
      <div className={`h-screen border-r p-5 pt-8 bg-white ${isExpanded ? "w-72" : "w-20"} duration-300 relative`}>
        
        {/* Sidebar toggle button */}
        <button
          className="absolute -right-3 top-9 text-black"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <BsArrowLeftCircle className={`text-3xl cursor-pointer ${!isExpanded && "rotate-180"}`} />
        </button>

        {/* Logo and title area */}
        <div className="inline-flex items-center">
          <img
            className={`h-10 w-10 mr-2 duration-500 ${isExpanded && "rotate-[360deg]"}`}
            src={logo}
            alt="InterLink Logo"
          />
          <span className={`text-2xl text-black tracking-tight duration-300 font-semibold ${!isExpanded && "scale-0"}`}>
            InterLink
          </span>
        </div>

        {/* Main Menu Items */}
        <ul className="pt-8">
          {menuItems.map((menu, index) => (
            <div key={`menu-${index}`}>
              
              {/* Conditionally render NavLink for "Dashboard Overview" only */}
              {menu.title === "Dashboard Overview" ? (
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `text-sm flex items-center gap-x-4 cursor-pointer p-2 rounded-md 
                    ${isActive ? "bg-indigo-200 text-indigo-800" : "text-indigo-700"} 
                    hover:bg-indigo-200 hover:text-indigo-800
                    hover:shadow-lg duration-300`
                  }
                >
                  <span className="text-black">{menu.icon || <BiSolidDashboard className="h-8 w-8 text-slate-500 -ml-[8px]" />}</span>
                  <span className={`text-sm font-medium flex-1 text-black duration-200 ${!isExpanded && "hidden"}`}>
                    {menu.title}
                  </span>
                </NavLink>
              ) : (
                <li
                  className={`relative text-sm flex items-center gap-x-4 cursor-pointer py-2 rounded-md
                    my-1 font-medium transition-colors
                    ${menu.spacing ? "mt-12" : "mt-4"}
                    ${activeMenuIndex === index ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-200" 
                      : "hover:bg-indigo-50 text-gray-600"}`}
                  onClick={() => handleMenuClick(index)}
                  aria-expanded={activeMenuIndex === index}
                  role="menuitem"
                >
                  <span className="text-black">{menu.icon}</span>
                  <span className={`text-sm font-medium flex-1 text-black duration-200 ${!isExpanded && "hidden"}`}>
                    {menu.title}
                  </span>
                  {/* Adjusted alert bubble positioning */}
                  {activeMenuIndex === index && (
                    <div className="absolute right-5 top-5 w-2 h-2 rounded-full bg-indigo-800" />
                  )}
                  {/* Icon to show menu expansion */}
                  {menu.submenuItems && (
                    <BsChevronDown className={`duration-300 text-black ${activeMenuIndex === index && "rotate-180"}`} />
                  )}
                </li>
              )}

              {/* Submenu items (visible when menu is expanded) */}
              {menu.submenuItems && isExpanded && activeMenuIndex === index && (
                <ul role="menu">
                  {menu.submenuItems.map((submenu, subIndex) => (
                    <NavLink
                      key={`submenu-${index}-${subIndex}`}
                      to={generatePath(menu.title, submenu.title)}
                      className={({ isActive }) =>
                        `text-sm flex items-center gap-x-4 cursor-pointer p-3 px-10 pe-0 rounded-md
                        ${isActive ? "bg-gray-100 text-gray-800" : "text-gray-600"}
                        hover:bg-gray-100 hover:text-gray-800 duration-300`
                      }
                      role="menuitem"
                    >
                      {submenu.title}
                    </NavLink>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default SideBar;


