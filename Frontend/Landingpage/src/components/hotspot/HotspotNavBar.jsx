import React, { useState } from "react";
import { Menu, X, Wifi, Package, Star, HelpCircle } from "lucide-react";
import dicondenlogo from "../../assets/dicondenlogo.png";

const HotspotNavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Plans', href: '#hotspot-plans', icon: <Package size={20} className="mr-2" /> },
    { label: 'Benefits', href: '#benefits', icon: <Star size={20} className="mr-2" /> },
    { label: 'Help', href: '#help', icon: <HelpCircle size={20} className="mr-2" /> },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-indigo-900/90 backdrop-blur-md py-3 shadow-lg border-b border-purple-500/20">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
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
          <span className="ml-2 text-sm bg-pink-500 text-white px-2 py-1 rounded-full">
            Hotspot
          </span>
        </a>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6 items-center">
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              className="text-white hover:text-pink-300 transition-colors duration-300 font-medium text-base flex items-center group"
            >
              {item.icon}
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pink-300 transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
          
          {/* Connection Status */}
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-purple-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-300 text-sm font-medium">WiFi Ready</span>
          </div>
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
        <div className="md:hidden bg-indigo-900/95 py-4 border-t border-purple-500/20">
          <div className="container mx-auto px-4">
            {navItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="block px-4 py-3 text-white hover:bg-pink-700/50 transition-colors text-base flex items-center rounded-lg mb-1"
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                {item.label}
              </a>
            ))}
            
            {/* Mobile Connection Status */}
            <div className="px-4 py-3 border-t border-purple-500/30 mt-2">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-green-300 text-sm">Connected via WiFi Hotspot</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default HotspotNavBar;