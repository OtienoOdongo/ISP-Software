// src/components/Common/MobileToast.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiX, FiAlertCircle, FiInfo } from 'react-icons/fi';

export const MobileToast = ({ message, type = 'success', isVisible, onClose }) => {
  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'info':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-green-500 text-white';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheck className="w-5 h-5 mr-2" />;
      case 'error':
        return <FiAlertCircle className="w-5 h-5 mr-2" />;
      case 'warning':
        return <FiAlertCircle className="w-5 h-5 mr-2" />;
      case 'info':
        return <FiInfo className="w-5 h-5 mr-2" />;
      default:
        return <FiCheck className="w-5 h-5 mr-2" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-sm px-4"
    >
      <div className={`${getToastStyles()} p-4 rounded-lg shadow-lg flex items-center justify-between`}>
        <div className="flex items-center">
          {getIcon()}
          <span className="text-sm font-medium">{message}</span>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:opacity-70 transition-opacity"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};