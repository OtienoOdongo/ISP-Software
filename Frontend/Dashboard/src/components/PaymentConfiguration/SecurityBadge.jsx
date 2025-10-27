

// import React from 'react';
// import { FiShield, FiAlertTriangle, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
// import { getSecurityLevel } from './Utils/paymentConstants';

// const SecurityBadge = ({ level }) => {
//   const securityLevel = getSecurityLevel(level);
  
//   const getIcon = () => {
//     switch(securityLevel.value) {
//       case 'critical': return <FiAlertTriangle className="h-4 w-4" />;
//       case 'high': return <FiAlertCircle className="h-4 w-4" />;
//       case 'secure': return <FiCheckCircle className="h-4 w-4" />;
//       default: return <FiShield className="h-4 w-4" />;
//     }
//   };

//   return (
//     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${securityLevel.color}`}>
//       {getIcon()}
//       <span className="ml-1">{securityLevel.label}</span>
//     </span>
//   );
// };

// export default SecurityBadge;





import React from 'react';
import { FiShield, FiAlertTriangle, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { getSecurityLevel } from './Utils/paymentConstants';

const SecurityBadge = ({ level, theme = 'light' }) => {
  const securityLevel = getSecurityLevel(level);
  
  const getIcon = () => {
    switch(securityLevel.value) {
      case 'critical': return <FiAlertTriangle className="h-4 w-4" />;
      case 'high': return <FiAlertCircle className="h-4 w-4" />;
      case 'secure': return <FiCheckCircle className="h-4 w-4" />;
      default: return <FiShield className="h-4 w-4" />;
    }
  };

  // Theme-based badge colors
  const badgeColors = {
    critical: theme === 'dark' ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800',
    high: theme === 'dark' ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-800',
    medium: theme === 'dark' ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
    secure: theme === 'dark' ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800',
    low: theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      badgeColors[securityLevel.value] || badgeColors.low
    }`}>
      {getIcon()}
      <span className="ml-1">{securityLevel.label}</span>
    </span>
  );
};

export default SecurityBadge;