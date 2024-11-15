import { useState, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { BsArrowLeftCircle, BsChevronDown } from "react-icons/bs";
import { BiSolidDashboard } from "react-icons/bi";
import logo from "../assets/logo.png";
import { menuItems } from "../constants/index.jsx";


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
          <span className={`text-2xl text-black tracking-tight duration-300 ${!isExpanded && "scale-0"}`}>
            Banana
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
                    ${isActive ? "bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-white" : "text-gray-300"}
                    hover:bg-gradient-to-r hover:from-purple-500 hover:via-fuchsia-500 hover:to-pink-500
                    hover:shadow-lg hover:shadow-purple-500/20 duration-300`
                  }
                >
                  <span className="text-black">{menu.icon || <BiSolidDashboard className="h-8 w-8" />}</span>
                  <span className={`text-sm font-medium flex-1 text-black duration-200 ${!isExpanded && "hidden"}`}>
                    {menu.title}
                  </span>
                </NavLink>
              ) : (
                <li
                  className={`text-sm flex items-center gap-x-4 cursor-pointer p-2 rounded-md 
                    ${menu.spacing ? "mt-9" : "mt-2"} 
                    ${activeMenuIndex === index ? "bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-white" : "text-gray-300"}
                    hover:bg-gradient-to-r hover:from-purple-500 hover:via-fuchsia-500 hover:to-pink-500
                    hover:shadow-lg hover:shadow-purple-500/20 duration-300`}
                  onClick={() => handleMenuClick(index)}
                  aria-expanded={activeMenuIndex === index}
                  role="menuitem"
                >
                  <span className="text-black">{menu.icon}</span>
                  <span className={`text-sm font-medium flex-1 text-black duration-200 ${!isExpanded && "hidden"}`}>
                    {menu.title}
                  </span>
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
                        ${isActive ? "bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-black" : "text-black"}
                        hover:bg-gradient-to-r hover:from-blue-500 hover:via-indigo-500 hover:to-violet-500
                        hover:text-white duration-300`
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
