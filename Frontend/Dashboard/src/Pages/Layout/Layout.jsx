// import React from 'react';
// import SideBar from "../../components/SideBar";
// import TopBar from "../../components/TopBar.jsx";
// import { Outlet } from "react-router-dom";

// /**
//  * Layout Component
//  * Main layout container that combines Sidebar, TopBar, and main content
//  */
// const Layout = () => {
//   return (
//     <div className="flex h-screen bg-gray-100"> 
//       {/* Sidebar section */}
//       <div className="h-screen relative">
//         {/* Make sure the sidebar is not affected by overflow on the main content */}
//         <SideBar />
//       </div>

//       {/* Main content wrapper */}
//       <div className="flex-1 flex flex-col bg-white"> {/* Set background color for main content */}
//         {/* Navigation bar */}
//         <TopBar />

//         {/* Main content area with an Outlet for nested routes */}
//         <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Layout;



// import React from "react";
// import SideBar from "../../components/SideBar";
// import TopBar from "../../components/TopBar.jsx";
// import { Outlet } from "react-router-dom";

// /**
//  * Layout Component
//  * Main layout container that combines Sidebar, TopBar, and main content
//  */
// const Layout = () => {
//   return (
//     <div className="flex h-screen bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] transition-theme">
//       {/* Sidebar section */}
//       <div className="h-screen relative">
//         {/* Make sure the sidebar is not affected by overflow on the main content */}
//         <SideBar />
//       </div>

//       {/* Main content wrapper */}
//       <div className="flex-1 flex flex-col bg-[var(--color-bg-primary)] transition-theme">
//         {/* Navigation bar */}
//         <TopBar />

//         {/* Main content area with an Outlet for nested routes */}
//         <main className="flex-1 p-6 bg-[var(--color-bg-secondary)] overflow-y-auto transition-theme">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Layout;



import React, { useState } from "react";
import SideBar from "../../components/SideBar";
import TopBar from "../../components/TopBar.jsx";
import { Outlet } from "react-router-dom";

/**
 * Layout Component
 * Main layout container that combines Sidebar, TopBar, and main content
 */
const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] transition-theme">
      {/* Sidebar section (shrink-0 for desktop width respect, collapses on mobile) */}
      <div className="shrink-0">
        <SideBar 
          onMobileMenuClose={handleMobileMenuClose}
          isMobileMenuOpen={isMobileMenuOpen}
        />
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={handleMobileMenuClose}
        />
      )}

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col bg-[var(--color-bg-primary)] transition-theme min-w-0">
        {/* Navigation bar */}
        <TopBar onMenuToggle={handleMenuToggle} />

        {/* Main content area with an Outlet for nested routes */}
        <main className="flex-1 p-4 sm:p-6 bg-[var(--color-bg-secondary)] overflow-y-auto transition-theme">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;