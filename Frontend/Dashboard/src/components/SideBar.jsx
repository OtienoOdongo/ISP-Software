// import { useState, useCallback } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import { BsArrowLeftCircle, BsChevronDown } from "react-icons/bs";
// import { menuItems } from "../constants/index.jsx";
// import { useAuth } from "../context/AuthContext";
// import dicondenlogo from "../assets/dicondenlogo.png"
// import dashboard from "../assets/dashboard.png"

// const SideBar = () => {
//   const [isExpanded, setIsExpanded] = useState(true);
//   const [activeMenuIndex, setActiveMenuIndex] = useState(null);
//   const { logout } = useAuth();
//   const navigate = useNavigate();

//   const handleMenuClick = useCallback(
//     (index) => {
//       setActiveMenuIndex(activeMenuIndex === index ? null : index);
//     },
//     [activeMenuIndex]
//   );

//   const handleLogout = useCallback(() => {
//     if (logout) {
//       logout();
//     } else {
//       localStorage.removeItem("accessToken");
//       localStorage.removeItem("refreshToken");
//     }
//     navigate("/login", { replace: true });
//   }, [logout, navigate]);

//   const generatePath = (menuTitle, submenuTitle) => {
//     if (menuTitle === "Dashboard Overview") {
//       return "/dashboard";
//     }
//     const cleanMenuTitle = menuTitle.toLowerCase().replace(/[\s&]+/g, "-").replace(/-+/g, "-");
//     const cleanSubmenuTitle = submenuTitle
//       .toLowerCase()
//       .replace(/[\s&]+/g, "-")
//       .replace(/-+/g, "-");
//     return `/dashboard/${cleanMenuTitle}/${cleanSubmenuTitle}`;
//   };

//   return (
//     <nav className="flex" role="navigation" aria-label="Main Navigation">
//       <div
//         className={`h-screen border-r p-5 pt-8 bg-white ${isExpanded ? "w-72" : "w-20"
//           } duration-300 relative`}
//       >
//         <button
//           className="absolute -right-3 top-9 text-black"
//           onClick={() => setIsExpanded(!isExpanded)}
//           aria-expanded={isExpanded}
//           aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
//         >
//           <BsArrowLeftCircle
//             className={`text-3xl cursor-pointer ${!isExpanded && "rotate-180"}`}
//           />
//         </button>

//         <div className="inline-flex items-center">
//           <img
//             className={`h-10 w-10 mr-2 duration-500 ${isExpanded && "rotate-[360deg]"}`}
//             src={dicondenlogo}
//             alt="Diconden Logo"
//           />
//           <span
//             className={`text-2xl text-black italic mt-3 ml-2 font-light tracking-tight duration-300  ${!isExpanded && "scale-0"
//               }`}
//           >
//             Diconden
//           </span>
//         </div>

//         <ul className="pt-8">
//           {menuItems.map((menu, index) => (
//             <div key={`menu-${index}`}>
//               {menu.title === "Dashboard Overview" ? (
//                 <NavLink
//                   to="/dashboard"
//                   className={({ isActive }) =>
//                     `text-xs flex items-center gap-x-4 cursor-pointer p-2 rounded-md text-indigo-700 ${isActive ? "bg-indigo-200 text-indigo-800" : ""
//                     } hover:bg-indigo-50 hover:text-indigo-800 hover:shadow-lg duration-300`
//                   }
//                 >
//                   <span className="text-black">
        
//                     {menu.icon || <img src={dashboard} alt="default icon" className="h-6 w-6 -ml-[8px] mr-[6px] " />}

//                   </span>
//                   <span
//                     className={`text-xs pr-3 font-medium flex-1 text-black duration-200 ${!isExpanded && "hidden"
//                       }`}
//                   >
//                     {menu.title}
//                   </span>
//                 </NavLink>
//               ) : menu.title === "LogOut" ? (
//                 <li
//                   className={`relative text-sm flex items-center gap-x-4 cursor-pointer py-2 rounded-md my-1 font-medium transition-colors ${menu.spacing ? "mt-12" : "mt-4"
//                     } hover:bg-indigo-50 text-gray-600`}
//                   onClick={handleLogout}
//                   role="menuitem"
//                 >
//                   <span className="text-black">{menu.icon}</span>
//                   <span
//                     className={`text-sm font-medium flex-1 text-black duration-200 ${!isExpanded && "hidden"
//                       }`}
//                   >
//                     {menu.title}
//                   </span>
//                 </li>
//               ) : (
//                 <li
//                   className={`relative text-sm flex items-center gap-x-4 cursor-pointer py-2 rounded-md my-1 font-medium transition-colors ${menu.spacing ? "mt-12" : "mt-4"
//                     } ${activeMenuIndex === index
//                       ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
//                       : "hover:bg-indigo-50 text-gray-600"
//                     }`}
//                   onClick={() => handleMenuClick(index)}
//                   aria-expanded={activeMenuIndex === index}
//                   role="menuitem"
//                 >
//                   <span className="text-black">{menu.icon}</span>
//                   <span
//                     className={`text-xs font-medium flex-1 text-black duration-200 ${!isExpanded && "hidden"
//                       }`}
//                   >
//                     {menu.title}
//                   </span>
//                   {activeMenuIndex === index && (
//                     <div className="absolute right-5 top-5 w-2 h-2 rounded-full bg-indigo-800" />
//                   )}
//                   {menu.submenuItems && (
//                     <BsChevronDown
//                       className={`duration-300 text-black ${activeMenuIndex === index && "rotate-180"
//                         }`}
//                     />
//                   )}
//                 </li>
//               )}

//               {menu.submenuItems && isExpanded && activeMenuIndex === index && (
//                 <ul role="menu">
//                   {menu.submenuItems.map((submenu, subIndex) => (
//                     <NavLink
//                       key={`submenu-${index}-${subIndex}`}
//                       to={generatePath(menu.title, submenu.title)}
//                       className={({ isActive }) =>
//                         `text-xs flex items-center gap-x-4 cursor-pointer p-3 px-10 pe-0 rounded-md ${isActive ? "bg-gray-100 text-gray-800" : "text-gray-600"
//                         } hover:bg-gray-100 hover:text-gray-800 duration-300`
//                       }
//                       role="menuitem"
//                     >
//                       {submenu.title}
//                     </NavLink>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           ))}
//         </ul>
//       </div>
//     </nav>
//   );
// };

// export default SideBar;





import { useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { BsArrowLeftCircle } from "react-icons/bs";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { menuItems } from "../constants/index.jsx";
import { useAuth } from "../context/AuthContext";
import dicondenlogo from "../assets/dicondenlogo.png";
import dashboard from "../assets/dashboard.png";

const SideBar = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeMenuIndex, setActiveMenuIndex] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleMenuClick = useCallback((index) => {
    setActiveMenuIndex(prevIndex => prevIndex === index ? null : index);
  }, []);

  const handleLogout = useCallback(() => {
    logout?.();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  const handleLogoClick = useCallback(() => {
    navigate("/dashboard");
    setActiveMenuIndex(null); // Close any open menus when logo is clicked
  }, [navigate]);

  const generatePath = (menuTitle, submenuTitle) => {
    if (menuTitle === "Dashboard") return "/dashboard";
    const slugify = (str) =>
      str.toLowerCase().replace(/[\s&]+/g, "-").replace(/-+/g, "-");
    return `/dashboard/${slugify(menuTitle)}/${slugify(submenuTitle)}`;
  };

  return (
    <nav className="flex" role="navigation" aria-label="Main Navigation">
      <div className={`h-screen border-r p-5 pt-8 bg-white transition-all duration-300 ${isExpanded ? "w-64" : "w-20"}`}>
        {/* Toggle Button */}
        <button
          className="absolute -right-3 top-9 text-gray-600 hover:text-gray-900 bg-white rounded-full shadow p-1"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          <BsArrowLeftCircle className={`text-xl transform transition-transform ${!isExpanded && "rotate-180"}`} />
        </button>

        {/* Logo */}
        <div className="inline-flex items-center cursor-pointer" onClick={handleLogoClick}>
          <img src={dicondenlogo} alt="Diconden Logo" className={`h-10 w-10 transition-transform ${isExpanded ? "mr-2 rotate-[360deg]" : ""}`} />
          <span className={`text-xl font-semibold tracking-tight text-gray-800 transition-all duration-300 ${!isExpanded && "scale-0"}`}>
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
                    `flex items-center gap-3 p-2.5 rounded-md text-sm font-medium ${
                      isActive ? "text-indigo-700" : "text-gray-600"
                    } hover:bg-indigo-50 transition-colors`
                  }
                  onClick={() => setActiveMenuIndex(null)} // Close any open menus when dashboard is clicked
                >
                  <img src={dashboard} alt="dashboard" className="h-5 w-5" />
                  {isExpanded && <span>{menu.title}</span>}
                </NavLink>
              ) : menu.title === "Logout" ? (
                <li
                  onClick={handleLogout}
                  className="flex items-center gap-3 p-2.5 rounded-md text-gray-600 hover:bg-red-100 hover:text-red-700 cursor-pointer transition-colors"
                >
                  <span>{menu.icon}</span>
                  {isExpanded && <span className="text-sm font-medium">{menu.title}</span>}
                </li>
              ) : (
                <>
                  <li
                    className={`relative flex items-center justify-between p-2.5 rounded-md text-sm cursor-pointer transition-colors ${
                      activeMenuIndex === index
                        ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-700"
                        : "text-gray-600 hover:bg-indigo-50"
                    }`}
                    onClick={() => handleMenuClick(index)}
                  >
                    <div className="flex items-center gap-3">
                      {menu.icon}
                      {isExpanded && <span>{menu.title}</span>}
                    </div>

                    {/* Active Dot */}
                    {activeMenuIndex === index && (
                      <span className="absolute right-8 top-4 w-2 h-2 rounded-full bg-indigo-800" />
                    )}

                    {/* Dropdown Icon */}
                    {menu.submenuItems && (
                      activeMenuIndex === index ? (
                        <ChevronDownIcon className={`w-4 h-4 text-indigo-600 ${!isExpanded && "hidden"}`} />
                      ) : (
                        <ChevronRightIcon className={`w-4 h-4 text-gray-500 ${!isExpanded && "hidden"}`} />
                      )
                    )}
                  </li>

                  {/* Submenu */}
                  {menu.submenuItems && isExpanded && activeMenuIndex === index && (
                    <ul className="ml-8 mt-1 space-y-1 transition-all duration-300">
                      {menu.submenuItems.map((submenu, subIndex) => (
                        <NavLink
                          key={`submenu-${index}-${subIndex}`}
                          to={generatePath(menu.title, submenu.title)}
                          className={({ isActive }) =>
                            `block text-xs px-3 py-2 rounded-md ${
                              isActive ? "text-gray-800 font-medium" : "text-gray-600"
                            } hover:bg-gray-100 hover:text-gray-800 transition`
                          }
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
      </div>
    </nav>
  );
};

export default SideBar;