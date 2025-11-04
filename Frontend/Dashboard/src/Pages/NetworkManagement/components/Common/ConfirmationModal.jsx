// src/Pages/NetworkManagement/components/Common/ConfirmationModal.jsx
import React from "react";
import CustomModal from "./CustomModal";
import CustomButton from "./CustomButton";

const ConfirmationModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  theme = "light" 
}) => {
  return (
    <CustomModal 
      isOpen={isOpen} 
      title={title} 
      onClose={onCancel} 
      size="sm"
      theme={theme}
    >
      <div className="space-y-4">
        <p className={`text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
          {message}
        </p>
        <div className="flex justify-end space-x-3 pt-4">
          <CustomButton
            onClick={onCancel}
            label={cancelLabel}
            variant="secondary"
          />
          <CustomButton
            onClick={onConfirm}
            label={confirmLabel}
            variant={variant}
          />
        </div>
      </div>
    </CustomModal>
  );
};

export default ConfirmationModal;