// import logo from "../assets/logo.png";
// import { navItems } from "../constants";
// import { Menu, X } from "lucide-react";
// import { useState } from "react";

// const NavBar = () => {
//   const [mobileOpen, setMobileOpen] = useState(false);

//   const toggleNavbar = () => {
//     setMobileOpen(!mobileOpen);
//   };

//   return (
//     <nav className="sticky top-0 z-50 py-3 backdrop-blur-lg border-b border-neutral-700/80">
//       <div className="container px-4 mx-auto relative text-sm">
//         {/* Flex container holding both logo and menu button */}
//         <div className="flex justify-between items-center border rounded-full border-neutral-700/80 pl-[10px] pt-2 pb-2"> 
//           {/* Logo Section */}
//           <div className="flex items-center flex-shrink-0">
//             <img className="h-10 w-10 mr-2" src={logo} alt="logo" />
//             <span className="text-xl tracking-tight">InterLink</span>
//           </div>

//           {/* Navigation Items - Hidden on mobile */}
//           <ul className="hidden lg:flex mr-[500px] space-x-12">
//             {navItems.map((item, index) => (
//               <li key={index}>
//                 <a href={item.href}>{item.label}</a>
//               </li>
//             ))}
//           </ul>

//           {/* Mobile Menu Button - Visible on small screens */}
//           <div className="lg:hidden pr-4 pl-4">
//             <button onClick={toggleNavbar}>
//               {mobileOpen ? <X /> : <Menu />}
//             </button>
//           </div>
//         </div>

//         {/* Mobile Menu Items - Conditionally displayed when clicked on small screen/devices */}
//         {mobileOpen && (
//           <ul className="flex flex-col mt-4 space-y-4 lg:hidden bg-neutral-900 items-end ml-auto md:items-end md:ml-auto">
//             {navItems.map((item, index) => (
//               <li key={index} className="py-2">
//                 <a href={item.href}>{item.label}</a>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default NavBar;

// import React, { useState } from 'react';
// import { navItems } from '../constants';
// import { Menu, X } from 'lucide-react';

// const NavBar = () => {
//   const [mobileOpen, setMobileOpen] = useState(false);

//   const toggleNavbar = () => setMobileOpen(!mobileOpen);

//   return (
//     <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-md py-4">
//       <div className="container mx-auto px-4 flex justify-between items-center">
//         <div className="flex items-center">
//           <span className="text-2xl font-bold text-indigo-600">InterLink</span>
//         </div>
//         <ul className="hidden md:flex space-x-8">
//           {navItems.map((item, index) => (
//             <li key={index}>
//               <a href={item.href} className="text-gray-700 hover:text-indigo-600 transition-colors">
//                 {item.label}
//               </a>
//             </li>
//           ))}
//         </ul>
//         <button className="md:hidden" onClick={toggleNavbar}>
//           {mobileOpen ? <X size={24} /> : <Menu size={24} />}
//         </button>
//       </div>
//       {mobileOpen && (
//         <ul className="md:hidden bg-white flex flex-col items-center py-4 space-y-4">
//           {navItems.map((item, index) => (
//             <li key={index}>
//               <a href={item.href} className="text-gray-700 hover:text-indigo-600" onClick={toggleNavbar}>
//                 {item.label}
//               </a>
//             </li>
//           ))}
//         </ul>
//       )}
//     </nav>
//   );
// };

// export default NavBar;


// import React, { useState } from 'react';
// import { navItems } from '../constants';
// import { Menu, X } from 'lucide-react';

// const NavBar = () => {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <nav className="fixed top-0 left-0 w-full z-50 bg-indigo-900/80 backdrop-blur-md py-4 shadow-lg">
//       <div className="container mx-auto px-4 flex items-center justify-between">
//         <a href="/" className="text-3xl font-extrabold tracking-tight text-white hover:text-pink-300 transition-colors">
//           InterLink
//         </a>
//         <div className="hidden md:flex space-x-8">
//           {navItems.map((item, index) => (
//             <a
//               key={index}
//               href={item.href}
//               className="text-white hover:text-pink-300 transition-colors duration-300 font-medium"
//             >
//               {item.label}
//             </a>
//           ))}
//         </div>
//         <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
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
//         </div>
//       )}
//     </nav>
//   );
// };

// export default NavBar;




import React, { useState } from 'react';
import { navItems } from '../constants';
import { Menu, X } from 'lucide-react';

const NavBar = ({ isLoggedIn, setIsLoggedIn }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('phoneNumber');
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-indigo-900/80 backdrop-blur-md py-4 shadow-lg">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <a href="/" className="text-3xl font-extrabold tracking-tight text-white hover:text-pink-300 transition-colors">
          SurfZone
        </a>
        <div className="hidden md:flex space-x-8">
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="text-white hover:text-pink-300 transition-colors duration-300 font-medium"
            >
              {item.label}
            </a>
          ))}
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="text-white hover:text-pink-300 transition-colors font-medium"
            >
              Log Out
            </button>
          )}
        </div>
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>
      {isOpen && (
        <div className="md:hidden bg-indigo-900/95 py-4">
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="block px-4 py-2 text-white hover:bg-pink-700/50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </a>
          ))}
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="block px-4 py-2 text-white hover:bg-pink-700/50 transition-colors w-full text-left"
            >
              Log Out
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default NavBar;