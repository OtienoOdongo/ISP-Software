// src/Pages/NetworkManagement/components/Common/CustomModal.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const CustomModal = ({ 
  isOpen, 
  title, 
  onClose, 
  children, 
  size = "md",
  theme = "light" 
}) => {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl"
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-colors duration-300"
          role="dialog" 
          aria-modal="true"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-xl ${
              theme === "dark" 
                ? "bg-gray-800/80 backdrop-blur-md text-white border border-gray-700" 
                : "bg-white/80 backdrop-blur-md text-gray-800 border border-gray-200"
            } transition-colors duration-300`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex justify-between items-center p-6 border-b ${
              theme === "dark" ? "border-gray-700" : "border-gray-200"
            }`}>
              <h3 className="text-lg font-semibold">{title}</h3>
              <button 
                onClick={onClose} 
                className={`p-1 rounded-full hover:opacity-70 transition-colors duration-300 ${
                  theme === "dark" 
                    ? "hover:bg-gray-700" 
                    : "hover:bg-gray-200"
                }`}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CustomModal;