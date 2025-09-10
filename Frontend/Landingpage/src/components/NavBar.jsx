


// import React, { useState } from "react";
// import { navItems } from "../constants";
// import { Menu, X, LogOut } from "lucide-react";

// const NavBar = ({ isLoggedIn, setIsLoggedIn, fullName, onLogout }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const displayName = fullName || "Guest";

//   return (
//     <nav className="fixed top-0 left-0 w-full z-50 bg-indigo-900/80 backdrop-blur-md py-4 shadow-lg">
//       <div className="container mx-auto px-4 flex items-center justify-between">
//         <a
//           href="/"
//           className="text-3xl font-extrabold tracking-tight text-white hover:text-pink-300 transition-colors duration-300"
//         >
//           SurfZone
//         </a>
//         <div className="hidden md:flex space-x-8 items-center">
//           {navItems.map((item, index) => (
//             <a
//               key={index}
//               href={item.href}
//               className="text-white hover:text-pink-300 transition-colors duration-300 font-medium"
//             >
//               {item.label}
//             </a>
//           ))}
//           {isLoggedIn ? (
//             <button
//               onClick={onLogout}
//               className="flex items-center text-white hover:text-pink-300 transition-colors font-medium bg-transparent border-2 border-pink-300 rounded-full px-4 py-1 hover:bg-pink-300 hover:text-indigo-900"
//             >
//               <LogOut size={18} className="mr-2" />
//               Log Out
//             </button>
//           ) : (
//             <span className="text-gray-400 font-medium">Hello, {displayName}</span>
//           )}
//         </div>
//         <button
//           className="md:hidden text-white focus:outline-none"
//           onClick={() => setIsOpen(!isOpen)}
//         >
//           {isOpen ? <X size={28} /> : <Menu size={28} />}
//         </button>
//       </div>
//       {isOpen && (
//         <div className="md:hidden bg-indigo-900/95 py-4">
//           {navItems.map((item, index) => (
//             <a
//               key={index}
//               href={item.href}
//               className="block px-4 py-2 text-white hover:bg-pink-700/50 transition-colors"
//               onClick={() => setIsOpen(false)}
//             >
//               {item.label}
//             </a>
//           ))}
//           {isLoggedIn ? (
//             <button
//               onClick={onLogout}
//               className="block px-4 py-2 text-white hover:bg-pink-700/50 transition-colors w-full text-left flex items-center"
//             >
//               <LogOut size={18} className="mr-2" />
//               Log Out
//             </button>
//           ) : (
//             <span className="block px-4 py-2 text-gray-400">Hello, {displayName}</span>
//           )}
//         </div>
//       )}
//     </nav>
//   );
// };

// export default NavBar;







// // Updated components/NavBar.jsx (full code with updates)

// import React, { useState } from "react";
// import { navItems } from "../constants";
// import { Menu, X, LogOut } from "lucide-react";

// const NavBar = ({ isLoggedIn, setIsLoggedIn, fullName, onLogout }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const displayName = fullName || "Guest";

//   return (
//     <nav className="fixed top-0 left-0 w-full z-50 bg-indigo-900/80 backdrop-blur-md py-4 shadow-lg">
//       <div className="container mx-auto px-4 flex items-center justify-between">
//         <a
//           href="/"
//           className="text-3xl font-extrabold tracking-tight text-white hover:text-pink-300 transition-colors duration-300"
//         >
//           SurfZone
//         </a>
//         <div className="hidden md:flex space-x-8 items-center">
//           {navItems.map((item, index) => (
//             <a
//               key={index}
//               href={item.href}
//               className="text-white hover:text-pink-300 transition-colors duration-300 font-medium text-lg" // Larger text
//             >
//               {item.label}
//             </a>
//           ))}
//           {isLoggedIn ? (
//             <button
//               onClick={onLogout}
//               className="flex items-center text-white hover:text-pink-300 transition-colors font-medium bg-transparent border-2 border-pink-300 rounded-full px-4 py-2 hover:bg-pink-300 hover:text-indigo-900 text-lg" // Larger
//             >
//               <LogOut size={20} className="mr-2" />
//               Log Out
//             </button>
//           ) : (
//             <span className="text-gray-400 font-medium text-lg">Hello, {displayName}</span> // Larger
//           )}
//         </div>
//         <button
//           className="md:hidden text-white focus:outline-none"
//           onClick={() => setIsOpen(!isOpen)}
//         >
//           {isOpen ? <X size={32} /> : <Menu size={32} />} 
//         </button>
//       </div>
//       {isOpen && (
//         <div className="md:hidden bg-indigo-900/95 py-4">
//           {navItems.map((item, index) => (
//             <a
//               key={index}
//               href={item.href}
//               className="block px-4 py-3 text-white hover:bg-pink-700/50 transition-colors text-lg" // Larger text
//               onClick={() => setIsOpen(false)}
//             >
//               {item.label}
//             </a>
//           ))}
//           {isLoggedIn ? (
//             <button
//               onClick={onLogout}
//               className="block px-4 py-3 text-white hover:bg-pink-700/50 transition-colors w-full text-left flex items-center text-lg" // Larger
//             >
//               <LogOut size={20} className="mr-2" />
//               Log Out
//             </button>
//           ) : (
//             <span className="block px-4 py-3 text-gray-400 text-lg">Hello, {displayName}</span> // Larger
//           )}
//         </div>
//       )}
//     </nav>
//   );
// };

// export default NavBar;





// import React, { useState } from "react";
// import { navItems } from "../constants";
// import { Menu, X, LogOut, Wifi, User, Home, Info, Gift } from "lucide-react";

// const NavBar = ({ isLoggedIn, setIsLoggedIn, fullName, onLogout }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const displayName = fullName || "Guest";

//   // Simplified navigation items with icons for better mobile UX
//   const enhancedNavItems = navItems.map(item => {
//     let icon;
//     switch(item.label.toLowerCase()) {
//       case 'home':
//         icon = <Home size={20} className="mr-2" />;
//         break;
//       case 'plans':
//         icon = <Wifi size={20} className="mr-2" />;
//         break;
//       case 'about':
//         icon = <Info size={20} className="mr-2" />;
//         break;
//       case 'promotions':
//         icon = <Gift size={20} className="mr-2" />;
//         break;
//       default:
//         icon = <User size={20} className="mr-2" />;
//     }
//     return { ...item, icon };
//   });

//   return (
//     <nav className="fixed top-0 left-0 w-full z-50 bg-indigo-900/90 backdrop-blur-md py-3 shadow-lg">
//       <div className="container mx-auto px-4 flex items-center justify-between">
//         <a
//           href="/"
//           className="text-2xl font-extrabold tracking-tight text-white hover:text-pink-300 transition-colors duration-300 flex items-center"
//         >
//           <Wifi size={24} className="mr-2" />
//           SurfZone
//         </a>
        
//         {/* Desktop Navigation */}
//         <div className="hidden md:flex space-x-4 items-center">
//           {enhancedNavItems.map((item, index) => (
//             <a
//               key={index}
//               href={item.href}
//               className="text-white hover:text-pink-300 transition-colors duration-300 font-medium text-base flex items-center"
//             >
//               {item.icon}
//               {item.label}
//             </a>
//           ))}
          
//           {isLoggedIn ? (
//             <button
//               onClick={onLogout}
//               className="flex items-center text-white hover:text-pink-300 transition-colors font-medium bg-transparent border border-pink-300 rounded-full px-3 py-1 hover:bg-pink-300 hover:text-indigo-900 text-base"
//             >
//               <LogOut size={18} className="mr-1" />
//               Log Out
//             </button>
//           ) : (
//             <span className="text-gray-300 font-medium text-base flex items-center">
//               <User size={18} className="mr-1" />
//               {displayName}
//             </span>
//           )}
//         </div>
        
//         {/* Mobile Menu Button */}
//         <button
//           className="md:hidden text-white focus:outline-none"
//           onClick={() => setIsOpen(!isOpen)}
//           aria-label="Toggle menu"
//         >
//           {isOpen ? <X size={28} /> : <Menu size={28} />}
//         </button>
//       </div>
      
//       {/* Mobile Navigation */}
//       {isOpen && (
//         <div className="md:hidden bg-indigo-900/95 py-2">
//           {enhancedNavItems.map((item, index) => (
//             <a
//               key={index}
//               href={item.href}
//               className="block px-4 py-3 text-white hover:bg-pink-700/50 transition-colors text-base flex items-center"
//               onClick={() => setIsOpen(false)}
//             >
//               {item.icon}
//               {item.label}
//             </a>
//           ))}
          
//           {isLoggedIn ? (
//             <button
//               onClick={() => {
//                 onLogout();
//                 setIsOpen(false);
//               }}
//               className="block px-4 py-3 text-white hover:bg-pink-700/50 transition-colors w-full text-left flex items-center text-base"
//             >
//               <LogOut size={18} className="mr-2" />
//               Log Out
//             </button>
//           ) : (
//             <span className="block px-4 py-3 text-gray-300 text-base flex items-center">
//               <User size={18} className="mr-2" />
//               {displayName}
//             </span>
//           )}
//         </div>
//       )}
//     </nav>
//   );
// };

// export default NavBar;


import React, { useState } from "react";
import { navItems } from "../constants";
import { Menu, X, Package, Star, HelpCircle } from "lucide-react";
import dicondenlogo from "../assets/dicondenlogo.png";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const enhancedNavItems = navItems.map(item => {
    let icon;
    switch (item.label.toLowerCase()) {
      case 'plans':
        icon = <Package size={20} className="mr-2" />;
        break;
      case 'benefits':
        icon = <Star size={20} className="mr-2" />;
        break;
      case 'help':
        icon = <HelpCircle size={20} className="mr-2" />;
        break;
      default:
        icon = null; // No default icon needed since all cases are covered
    }
    return { ...item, icon };
  });

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-indigo-900/90 backdrop-blur-md py-3 shadow-lg">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <a
          href="/"
          className="text-2xl font-extrabold tracking-tight text-white hover:text-pink-300 transition-colors duration-300 flex items-center"
        >
          <img
            src={dicondenlogo}
            alt="SurfZone Logo"
            className="w-6 h-6 mr-2 object-contain"
          />
          SurfZone
        </a>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-4 items-center">
          {enhancedNavItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="text-white hover:text-pink-300 transition-colors duration-300 font-medium text-base flex items-center"
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </div>
        
        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-indigo-900/95 py-2">
          {enhancedNavItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="block px-4 py-3 text-white hover:bg-pink-700/50 transition-colors text-base flex items-center"
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              {item.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

export default NavBar;