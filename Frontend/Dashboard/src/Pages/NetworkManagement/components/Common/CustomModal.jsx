

// // src/Pages/NetworkManagement/components/Common/CustomModal.jsx
// import React from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { X } from "lucide-react";
// import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components"

// const CustomModal = ({ 
//   isOpen, 
//   title, 
//   onClose, 
//   children, 
//   size = "md",
//   theme = "light" 
// }) => {
//   const themeClasses = getThemeClasses(theme);
  
//   const sizeClasses = {
//     sm: "max-w-md",
//     md: "max-w-2xl",
//     lg: "max-w-4xl",
//     xl: "max-w-6xl"
//   };
  
//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-colors duration-300"
//           role="dialog" 
//           aria-modal="true"
//           onClick={onClose}
//         >
//           <motion.div
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.9, opacity: 0 }}
//             className={`${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className={`flex justify-between items-center p-6 border-b ${themeClasses.border.light}`}>
//               <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>{title}</h3>
//               <button 
//                 onClick={onClose} 
//                 className={`p-1 rounded-full hover:opacity-70 transition-colors duration-300 ${
//                   theme === "dark" 
//                     ? "hover:bg-gray-700" 
//                     : "hover:bg-gray-200"
//                 }`}
//                 aria-label="Close modal"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
//             <div className="p-6">
//               {children}
//             </div>
//           </motion.div>
//         </div>
//       )}
//     </AnimatePresence>
//   );
// };

// export default CustomModal;







// src/Pages/NetworkManagement/components/Common/CustomModal.jsx
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components"

const CustomModal = ({ 
  isOpen, 
  title, 
  onClose, 
  children, 
  size = "md",
  theme = "light",
  closeOnOverlayClick = true,
  showCloseButton = true,
  preventScroll = true
}) => {
  const themeClasses = getThemeClasses(theme);
  
  const sizeClasses = {
    xs: "max-w-sm",
    sm: "max-w-md",
    md: "max-w-2xl", 
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-full mx-4"
  };
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (preventScroll && isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, preventScroll]);
  
  // Handle ESC key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-colors duration-300 backdrop-blur-sm"
          role="dialog" 
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
          onClick={closeOnOverlayClick ? onClose : undefined}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border ${themeClasses.bg.card} ${themeClasses.border.light}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className={`flex justify-between items-center p-6 border-b ${themeClasses.border.light} sticky top-0 ${themeClasses.bg.card} z-10`}>
                {title && (
                  <h3 
                    id="modal-title"
                    className={`text-lg font-semibold ${themeClasses.text.primary}`}
                  >
                    {title}
                  </h3>
                )}
                {showCloseButton && (
                  <button 
                    onClick={onClose} 
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      theme === "dark" 
                        ? "hover:bg-gray-700 text-gray-400 hover:text-gray-200" 
                        : "hover:bg-gray-200 text-gray-500 hover:text-gray-700"
                    }`}
                    aria-label="Close modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            
            {/* Content */}
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