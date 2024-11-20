import React from 'react';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-white py-6 mt-auto">
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* Copyright */}
        <p className="text-sm">© 2024 InterLink. All rights reserved.</p>
        
        {/* Social Media Links */}
        <div className="flex space-x-6">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-500">
            <FaFacebookF className="w-5 h-5" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-400">
            <FaTwitter className="w-5 h-5" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-700">
            <FaLinkedinIn className="w-5 h-5" />
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-gray-400">
            <FaGithub className="w-5 h-5" />
          </a>
        </div>
        
        {/* Legal Links */}
        <div className="flex space-x-6">
          <a href="/privacy-policy" className="text-sm hover:underline">Privacy Policy</a>
          <a href="/terms-of-service" className="text-sm hover:underline">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
