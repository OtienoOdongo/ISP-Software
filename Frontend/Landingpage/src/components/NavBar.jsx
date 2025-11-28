

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