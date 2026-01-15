import React from 'react';
import { FiMoreVertical } from 'react-icons/fi';

const Card = ({ 
  children, 
  title, 
  subtitle,
  actions,
  className = '',
  theme = 'light',
  padding = true,
  border = true,
  shadow = true,
  onClick
}) => {
  const themeClasses = {
    container: theme === 'dark' 
      ? 'bg-gray-800 text-gray-100' 
      : 'bg-white text-gray-900',
    border: theme === 'dark' 
      ? 'border-gray-700' 
      : 'border-gray-200',
    heading: theme === 'dark' ? 'text-white' : 'text-gray-800',
    subheading: theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
  };

  const baseClasses = [
    'rounded-xl',
    padding && 'p-4 md:p-6',
    border && `border ${themeClasses.border}`,
    shadow && 'shadow-sm',
    onClick && 'cursor-pointer hover:shadow-md transition-shadow',
    themeClasses.container,
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={baseClasses}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Header Section */}
      {(title || subtitle || actions) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {title && (
              <h3 className={`font-semibold ${themeClasses.heading}`}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={`text-sm mt-1 ${themeClasses.subheading}`}>
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Actions Menu */}
          {actions && (
            <div className="relative">
              <button
                className={`p-1 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-700 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle actions menu
                }}
              >
                <FiMoreVertical size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className={padding ? '' : 'first:pt-0 last:pb-0'}>
        {children}
      </div>

      {/* Footer Section */}
      {actions && typeof actions === 'function' && (
        <div className="mt-4 pt-4 border-t border-gray-700 dark:border-gray-600">
          {actions()}
        </div>
      )}
    </div>
  );
};

// Card Header Component
const CardHeader = ({ children, className = '', theme = 'light' }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

// Card Body Component
const CardBody = ({ children, className = '', padding = true }) => (
  <div className={`${padding ? 'py-2' : ''} ${className}`}>
    {children}
  </div>
);

// Card Footer Component
const CardFooter = ({ children, className = '', theme = 'light' }) => (
  <div className={`mt-4 pt-4 border-t ${
    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
  } ${className}`}>
    {children}
  </div>
);

// Stat Card Component
const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon,
  color = 'blue',
  theme = 'light'
}) => {
  const colorClasses = {
    blue: {
      bg: theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-100',
      icon: 'text-blue-500',
      value: theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
    },
    green: {
      bg: theme === 'dark' ? 'bg-green-900/30' : 'bg-green-100',
      icon: 'text-green-500',
      value: theme === 'dark' ? 'text-green-400' : 'text-green-600'
    },
    red: {
      bg: theme === 'dark' ? 'bg-red-900/30' : 'bg-red-100',
      icon: 'text-red-500',
      value: theme === 'dark' ? 'text-red-400' : 'text-red-600'
    },
    yellow: {
      bg: theme === 'dark' ? 'bg-yellow-900/30' : 'bg-yellow-100',
      icon: 'text-yellow-500',
      value: theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
    },
    purple: {
      bg: theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-100',
      icon: 'text-purple-500',
      value: theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
    }
  };

  const currentColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`p-4 rounded-xl border ${
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1 ${currentColor.value}`}>
            {value}
          </p>
          {change && (
            <p className={`text-xs mt-1 ${
              change.direction === 'up' 
                ? 'text-green-500' 
                : change.direction === 'down'
                ? 'text-red-500'
                : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {change.direction === 'up' ? '↑' : change.direction === 'down' ? '↓' : '→'} 
              {change.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg ${currentColor.bg}`}>
            <Icon size={24} className={currentColor.icon} />
          </div>
        )}
      </div>
    </div>
  );
};

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
Card.Stat = StatCard;

export default Card;