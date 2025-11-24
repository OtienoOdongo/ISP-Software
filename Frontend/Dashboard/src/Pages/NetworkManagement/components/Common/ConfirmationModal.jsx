// // src/Pages/NetworkManagement/components/Common/ConfirmationModal.jsx
// import React from "react";
// import CustomModal from "./CustomModal";
// import CustomButton from "./CustomButton";

// const ConfirmationModal = ({ 
//   isOpen, 
//   title, 
//   message, 
//   onConfirm, 
//   onCancel,
//   confirmLabel = "Confirm",
//   cancelLabel = "Cancel",
//   variant = "danger",
//   theme = "light" 
// }) => {
//   return (
//     <CustomModal 
//       isOpen={isOpen} 
//       title={title} 
//       onClose={onCancel} 
//       size="sm"
//       theme={theme}
//     >
//       <div className="space-y-4">
//         <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
//           {message}
//         </p>
//         <div className="flex justify-end space-x-3 pt-4">
//           <CustomButton
//             onClick={onCancel}
//             label={cancelLabel}
//             variant="secondary"
//           />
//           <CustomButton
//             onClick={onConfirm}
//             label={confirmLabel}
//             variant={variant}
//           />
//         </div>
//       </div>
//     </CustomModal>
//   );
// };

// export default ConfirmationModal;







// src/Pages/NetworkManagement/components/Common/ConfirmationModal.jsx
import React from "react";
import { AlertTriangle, Info, Trash2, Power, RefreshCw } from "lucide-react";
import CustomModal from "./CustomModal";
import CustomButton from "./CustomButton";
import { getThemeClasses } from "../../../../components/ServiceManagement/Shared/components"

const ConfirmationModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  theme = "light",
  icon = "warning",
  isLoading = false,
  destructive = true,
  size = "sm",
  showCancel = true
}) => {
  const themeClasses = getThemeClasses(theme);
  
  const getIcon = () => {
    const iconProps = { className: "w-6 h-6" };
    
    switch (icon) {
      case "info":
        return <Info {...iconProps} className={`text-blue-500 ${iconProps.className}`} />;
      case "delete":
        return <Trash2 {...iconProps} className={`text-red-500 ${iconProps.className}`} />;
      case "power":
        return <Power {...iconProps} className={`text-orange-500 ${iconProps.className}`} />;
      case "refresh":
        return <RefreshCw {...iconProps} className={`text-blue-500 ${iconProps.className}`} />;
      case "warning":
      default:
        return <AlertTriangle {...iconProps} className={`text-yellow-500 ${iconProps.className}`} />;
    }
  };

  const getVariantConfig = () => {
    switch (variant) {
      case "danger":
        return { 
          buttonVariant: "danger",
          icon: "warning",
          bgColor: "bg-red-50 dark:bg-red-900/20",
          borderColor: "border-red-200 dark:border-red-800"
        };
      case "warning":
        return { 
          buttonVariant: "warning",
          icon: "warning", 
          bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
          borderColor: "border-yellow-200 dark:border-yellow-800"
        };
      case "success":
        return { 
          buttonVariant: "success",
          icon: "info",
          bgColor: "bg-green-50 dark:bg-green-900/20",
          borderColor: "border-green-200 dark:border-green-800"
        };
      case "info":
      default:
        return { 
          buttonVariant: "primary",
          icon: "info",
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          borderColor: "border-blue-200 dark:border-blue-800"
        };
    }
  };

  const variantConfig = getVariantConfig();

  return (
    <CustomModal 
      isOpen={isOpen} 
      title={title} 
      onClose={onCancel} 
      size={size}
      theme={theme}
    >
      <div className="space-y-6">
        <div className={`flex items-start space-x-4 p-4 rounded-lg border ${variantConfig.bgColor} ${variantConfig.borderColor}`}>
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1">
            <p className={`text-sm leading-relaxed ${themeClasses.text.primary}`}>
              {message}
            </p>
          </div>
        </div>

        {destructive && (
          <div className={`p-3 rounded-lg border ${
            theme === "dark" ? "bg-red-900/10 border-red-800" : "bg-red-50 border-red-200"
          }`}>
            <p className={`text-xs text-red-700 dark:text-red-300`}>
              ⚠️ This action cannot be undone. Please confirm you want to proceed.
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          {showCancel && (
            <CustomButton
              onClick={onCancel}
              label={cancelLabel}
              variant="secondary"
              disabled={isLoading}
              theme={theme}
            />
          )}
          <CustomButton
            onClick={onConfirm}
            label={confirmLabel}
            variant={variantConfig.buttonVariant}
            disabled={isLoading}
            loading={isLoading}
            theme={theme}
          />
        </div>
      </div>
    </CustomModal>
  );
};

export default ConfirmationModal;