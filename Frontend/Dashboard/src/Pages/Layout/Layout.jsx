import React from 'react';
import SideBar from "../../components/SideBar";
import TopBar from "../../components/TopBar.jsx";
import { Outlet } from "react-router-dom";

/**
 * Layout Component
 * Main layout container that combines Sidebar, TopBar, and main content
 */
const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-100"> 
      {/* Sidebar section */}
      <div className="h-screen relative">
        {/* Make sure the sidebar is not affected by overflow on the main content */}
        <SideBar />
      </div>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col bg-white"> {/* Set background color for main content */}
        {/* Navigation bar */}
        <TopBar />

        {/* Main content area with an Outlet for nested routes */}
        <main className="flex-1 p-6 bg-gray-100 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
