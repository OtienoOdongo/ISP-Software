import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  theme = 'light',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showCloseButton = true
}) => {
  // Handle ESC key press
  useEffect(() => {
    const handleEsc = (event) => {
      if (closeOnEsc && event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset'; // Re-enable scrolling
    };
  }, [isOpen, onClose, closeOnEsc]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };

  // Theme classes
  const themeClasses = {
    overlay: theme === 'dark' 
      ? 'bg-black/70' 
      : 'bg-black/50',
    modal: theme === 'dark'
      ? 'bg-gray-800 text-gray-100'
      : 'bg-white text-gray-900',
    header: theme === 'dark'
      ? 'border-gray-700'
      : 'border-gray-200',
    footer: theme === 'dark'
      ? 'border-gray-700'
      : 'border-gray-200'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 transition-opacity"
        onClick={handleOverlayClick}
      >
        <div className={`absolute inset-0 ${themeClasses.overlay}`} />
      </div>

      {/* Modal Container */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className={`relative w-full ${sizeClasses[size]} transform overflow-hidden rounded-xl shadow-xl transition-all`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Modal Content */}
          <div className={themeClasses.modal}>
            {/* Header */}
            {(title || showCloseButton) && (
              <div className={`flex items-center justify-between border-b px-6 py-4 ${themeClasses.header}`}>
                {title && (
                  <h3
                    id="modal-title"
                    className="text-lg font-semibold"
                  >
                    {title}
                  </h3>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className={`ml-4 p-1 rounded-full transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                        : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'
                    }`}
                    aria-label="Close modal"
                  >
                    <FiX size={20} />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="px-6 py-4">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className={`border-t px-6 py-4 ${themeClasses.footer}`}>
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal.Header Component
const ModalHeader = ({ 
  children, 
  className = '', 
  theme = 'light' 
}) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

// Modal.Body Component
const ModalBody = ({ 
  children, 
  className = '', 
  padding = true 
}) => (
  <div className={`${padding ? 'py-2' : ''} ${className}`}>
    {children}
  </div>
);

// Modal.Footer Component
const ModalFooter = ({ 
  children, 
  className = '', 
  align = 'right',
  theme = 'light'
}) => {
  const alignment = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  }[align] || 'justify-end';

  return (
    <div className={`flex ${alignment} gap-2 ${className}`}>
      {children}
    </div>
  );
};

// Confirmation Modal
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  theme = 'light'
}) => {
  const variantClasses = {
    danger: {
      confirm: theme === 'dark'
        ? 'bg-red-600 hover:bg-red-700'
        : 'bg-red-500 hover:bg-red-600',
      icon: '🔴'
    },
    warning: {
      confirm: theme === 'dark'
        ? 'bg-yellow-600 hover:bg-yellow-700'
        : 'bg-yellow-500 hover:bg-yellow-600',
      icon: '⚠️'
    },
    success: {
      confirm: theme === 'dark'
        ? 'bg-green-600 hover:bg-green-700'
        : 'bg-green-500 hover:bg-green-600',
      icon: '✅'
    },
    info: {
      confirm: theme === 'dark'
        ? 'bg-blue-600 hover:bg-blue-700'
        : 'bg-blue-500 hover:bg-blue-600',
      icon: 'ℹ️'
    }
  };

  const currentVariant = variantClasses[variant] || variantClasses.danger;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      theme={theme}
    >
      <ModalBody>
        <div className="text-center py-4">
          <div className="text-4xl mb-4">{currentVariant.icon}</div>
          <p className="mb-4">{message}</p>
        </div>
      </ModalBody>
      
      <ModalFooter>
        <button
          onClick={onClose}
          className={`px-4 py-2 rounded-lg font-medium ${
            theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-4 py-2 rounded-lg font-medium text-white ${currentVariant.confirm}`}
        >
          {confirmText}
        </button>
      </ModalFooter>
    </Modal>
  );
};

// Alert Modal
const AlertModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  theme = 'light'
}) => {
  const typeConfig = {
    info: {
      icon: 'ℹ️',
      color: 'text-blue-500',
      bg: theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'
    },
    success: {
      icon: '✅',
      color: 'text-green-500',
      bg: theme === 'dark' ? 'bg-green-900/30' : 'bg-green-50'
    },
    warning: {
      icon: '⚠️',
      color: 'text-yellow-500',
      bg: theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-50'
    },
    error: {
      icon: '❌',
      color: 'text-red-500',
      bg: theme === 'dark' ? 'bg-red-900/30' : 'bg-red-50'
    }
  };

  const currentType = typeConfig[type] || typeConfig.info;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      theme={theme}
    >
      <ModalBody>
        <div className="text-center py-4">
          <div className={`text-4xl mb-4 ${currentType.color}`}>
            {currentType.icon}
          </div>
          <p className="mb-4">{message}</p>
        </div>
      </ModalBody>
      
      <ModalFooter>
        <button
          onClick={onClose}
          className={`px-4 py-2 rounded-lg font-medium ${
            theme === 'dark'
              ? 'bg-gray-700 hover:bg-gray-600'
              : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          OK
        </button>
      </ModalFooter>
    </Modal>
  );
};

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
Modal.Confirmation = ConfirmationModal;
Modal.Alert = AlertModal;

export default Modal;