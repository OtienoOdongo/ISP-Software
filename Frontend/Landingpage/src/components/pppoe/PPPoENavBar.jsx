// import React, { useState } from "react";
// import { Menu, X, Ethernet, User, LogOut, Settings } from "lucide-react";
// import dicondenlogo from "../../assets/dicondenlogo.png";

// const PPPoENavBar = ({ isAuthenticated, clientData, onLogout }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [showUserMenu, setShowUserMenu] = useState(false);

//   const navItems = [
//     { label: 'Dashboard', href: '#dashboard', icon: <Ethernet size={20} className="mr-2" /> },
//     { label: 'Plans', href: '#pppoe-plans', icon: <Settings size={20} className="mr-2" /> },
//   ];

//   const handleLogout = () => {
//     setShowUserMenu(false);
//     onLogout();
//   };

//   return (
//     <nav className="fixed top-0 left-0 w-full z-50 bg-blue-900/90 backdrop-blur-md py-3 shadow-lg border-b border-blue-500/20">
//       <div className="container mx-auto px-4 flex items-center justify-between">
//         {/* Logo */}
//         <a
//           href="/"
//           className="text-2xl font-extrabold tracking-tight text-white hover:text-blue-300 transition-colors duration-300 flex items-center"
//         >
//           <img
//             src={dicondenlogo}
//             alt="SurfZone Logo"
//             className="w-6 h-6 mr-2 object-contain"
//           />
//           SurfZone
//           <span className="ml-2 text-sm bg-blue-500 text-white px-2 py-1 rounded-full">
//             PPPoE
//           </span>
//         </a>
        
//         {/* Desktop Navigation */}
//         <div className="hidden md:flex space-x-6 items-center">
//           {navItems.map((item, index) => (
//             <a
//               key={index}
//               href={item.href}
//               className="text-white hover:text-blue-300 transition-colors duration-300 font-medium text-base flex items-center group"
//             >
//               {item.icon}
//               {item.label}
//               <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-300 transition-all duration-300 group-hover:w-full"></span>
//             </a>
//           ))}
          
//           {/* User Section */}
//           {isAuthenticated && clientData ? (
//             <div className="relative ml-4 pl-4 border-l border-blue-500/30">
//               <button
//                 onClick={() => setShowUserMenu(!showUserMenu)}
//                 className="flex items-center gap-3 text-white hover:text-blue-300 transition-colors p-2 rounded-lg hover:bg-white/10"
//               >
//                 <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
//                   <User className="w-4 h-4 text-white" />
//                 </div>
//                 <div className="text-left">
//                   <p className="text-sm font-medium">{clientData.username}</p>
//                   <p className="text-xs text-blue-300">PPPoE User</p>
//                 </div>
//               </button>

//               {/* User Dropdown Menu */}
//               {showUserMenu && (
//                 <div className="absolute right-0 top-full mt-2 w-48 bg-blue-800/95 backdrop-blur-md rounded-lg shadow-xl border border-blue-500/20 py-2 z-50">
//                   <div className="px-4 py-2 border-b border-blue-500/20">
//                     <p className="text-white font-medium text-sm">{clientData.username}</p>
//                     <p className="text-blue-300 text-xs">{clientData.pppoe_username}</p>
//                   </div>
                  
//                   <button
//                     onClick={handleLogout}
//                     className="w-full px-4 py-2 text-left text-white hover:bg-red-500/20 hover:text-red-300 transition-colors flex items-center gap-2 text-sm"
//                   >
//                     <LogOut className="w-4 h-4" />
//                     Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <div className="flex items-center gap-2 ml-4 pl-4 border-l border-blue-500/30">
//               <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
//               <span className="text-yellow-300 text-sm font-medium">Not Connected</span>
//             </div>
//           )}
//         </div>
        
//         {/* Mobile Menu Button */}
//         <button
//           className="md:hidden text-white focus:outline-none p-2 hover:bg-white/10 rounded-lg transition-colors"
//           onClick={() => setIsOpen(!isOpen)}
//           aria-label="Toggle menu"
//         >
//           {isOpen ? <X size={24} /> : <Menu size={24} />}
//         </button>
//       </div>
      
//       {/* Mobile Navigation */}
//       {isOpen && (
//         <div className="md:hidden bg-blue-900/95 py-4 border-t border-blue-500/20">
//           <div className="container mx-auto px-4">
//             {navItems.map((item, index) => (
//               <a
//                 key={index}
//                 href={item.href}
//                 className="block px-4 py-3 text-white hover:bg-blue-700/50 transition-colors text-base flex items-center rounded-lg mb-1"
//                 onClick={() => setIsOpen(false)}
//               >
//                 {item.icon}
//                 {item.label}
//               </a>
//             ))}
            
//             {/* Mobile User Info */}
//             {isAuthenticated && clientData && (
//               <div className="px-4 py-3 border-t border-blue-500/30 mt-2">
//                 <div className="flex items-center gap-3 mb-3">
//                   <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
//                     <User className="w-5 h-5 text-white" />
//                   </div>
//                   <div>
//                     <p className="text-white font-medium">{clientData.username}</p>
//                     <p className="text-blue-300 text-sm">{clientData.pppoe_username}</p>
//                   </div>
//                 </div>
                
//                 <button
//                   onClick={handleLogout}
//                   className="w-full px-4 py-2 text-red-300 hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-2 justify-center text-sm border border-red-500/30"
//                 >
//                   <LogOut className="w-4 h-4" />
//                   Logout
//                 </button>
//               </div>
//             )}
            
//             {/* Mobile Connection Status */}
//             <div className="px-4 py-3 border-t border-blue-500/30 mt-2">
//               <div className="flex items-center gap-2">
//                 <Ethernet className="w-4 h-4 text-blue-400" />
//                 <span className="text-blue-300 text-sm">
//                   {isAuthenticated ? 'PPPoE Portal' : 'PPPoE Login Required'}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default PPPoENavBar;





import React, { useState } from "react";
import { Menu, X, Network, User, LogOut, Settings } from "lucide-react";
import dicondenlogo from "../../assets/dicondenlogo.png";

const PPPoENavBar = ({ isAuthenticated, clientData, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '#dashboard', icon: <Network size={20} className="mr-2" /> },
    { label: 'Plans', href: '#pppoe-plans', icon: <Settings size={20} className="mr-2" /> },
  ];

  const handleLogout = () => {
    setShowUserMenu(false);
    onLogout();
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-blue-900/90 backdrop-blur-md py-3 shadow-lg border-b border-blue-500/20">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <a
          href="/"
          className="text-2xl font-extrabold tracking-tight text-white hover:text-blue-300 transition-colors duration-300 flex items-center"
        >
          <img
            src={dicondenlogo}
            alt="SurfZone Logo"
            className="w-6 h-6 mr-2 object-contain"
          />
          SurfZone
          <span className="ml-2 text-sm bg-blue-500 text-white px-2 py-1 rounded-full">
            PPPoE
          </span>
        </a>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6 items-center">
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="text-white hover:text-blue-300 transition-colors duration-300 font-medium text-base flex items-center group"
            >
              {item.icon}
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-300 transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
          
          {/* User Section */}
          {isAuthenticated && clientData ? (
            <div className="relative ml-4 pl-4 border-l border-blue-500/30">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 text-white hover:text-blue-300 transition-colors p-2 rounded-lg hover:bg-white/10"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">{clientData.username}</p>
                  <p className="text-xs text-blue-300">PPPoE User</p>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-blue-800/95 backdrop-blur-md rounded-lg shadow-xl border border-blue-500/20 py-2 z-50">
                  <div className="px-4 py-2 border-b border-blue-500/20">
                    <p className="text-white font-medium text-sm">{clientData.username}</p>
                    <p className="text-blue-300 text-xs">{clientData.pppoe_username}</p>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-white hover:bg-red-500/20 hover:text-red-300 transition-colors flex items-center gap-2 text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-blue-500/30">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-yellow-300 text-sm font-medium">Not Connected</span>
            </div>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white focus:outline-none p-2 hover:bg-white/10 rounded-lg transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-blue-900/95 py-4 border-t border-blue-500/20">
          <div className="container mx-auto px-4">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="block px-4 py-3 text-white hover:bg-blue-700/50 transition-colors text-base flex items-center rounded-lg mb-1"
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                {item.label}
              </a>
            ))}
            
            {/* Mobile User Info */}
            {isAuthenticated && clientData && (
              <div className="px-4 py-3 border-t border-blue-500/30 mt-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{clientData.username}</p>
                    <p className="text-blue-300 text-sm">{clientData.pppoe_username}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-red-300 hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-2 justify-center text-sm border border-red-500/30"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
            
            {/* Mobile Connection Status */}
            <div className="px-4 py-3 border-t border-blue-500/30 mt-2">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 text-sm">
                  {isAuthenticated ? 'PPPoE Portal' : 'PPPoE Login Required'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PPPoENavBar;