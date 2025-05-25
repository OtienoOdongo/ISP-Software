// import React from 'react';
// import { FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';

// const SecurityBadge = ({ level = 'medium' }) => {
//   const levelConfig = {
//     critical: {
//       color: 'text-red-500',
//       icon: <FaExclamationTriangle className="mr-1" />
//     },
//     high: {
//       color: 'text-orange-500',
//       icon: <FaShieldAlt className="mr-1" />
//     },
//     medium: {
//       color: 'text-yellow-500',
//       icon: <FaShieldAlt className="mr-1" />
//     },
//     low: {
//       color: 'text-blue-500',
//       icon: <FaShieldAlt className="mr-1" />
//     }
//   };

//   const config = levelConfig[level] || levelConfig.medium;

//   return (
//     <span className={`inline-flex items-center ${config.color}`}>
//       {config.icon}
//     </span>
//   );
// };

// export default SecurityBadge;







// import React from 'react';
// import { FiShield, FiAlertTriangle } from 'react-icons/fi';

// const SecurityBadge = ({ level = 'medium' }) => {
//   const levelConfig = {
//     critical: {
//       color: 'text-red-500',
//       icon: <FiAlertTriangle className="mr-1" />
//     },
//     high: {
//       color: 'text-orange-500',
//       icon: <FiShield className="mr-1" />
//     },
//     medium: {
//       color: 'text-yellow-500',
//       icon: <FiShield className="mr-1" />
//     },
//     low: {
//       color: 'text-blue-500',
//       icon: <FiShield className="mr-1" />
//     }
//   };

//   const config = levelConfig[level] || levelConfig.medium;

//   return (
//     <span className={`inline-flex items-center ${config.color}`}>
//       {config.icon}
//     </span>
//   );
// };

// export default SecurityBadge;





import React from 'react';
import PropTypes from 'prop-types';
import { FiShield, FiAlertTriangle, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

const SecurityBadge = ({ level = 'medium' }) => {
  const levelConfig = {
    critical: {
      color: 'text-red-500',
      bgColor: 'bg-red-100',
      icon: <FiAlertTriangle className="h-4 w-4" />,
      label: 'Critical'
    },
    high: {
      color: 'text-orange-500',
      bgColor: 'bg-orange-100',
      icon: <FiAlertCircle className="h-4 w-4" />,
      label: 'High'
    },
    medium: {
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-100',
      icon: <FiShield className="h-4 w-4" />,
      label: 'Medium'
    },
    low: {
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
      icon: <FiShield className="h-4 w-4" />,
      label: 'Low'
    },
    secure: {
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      icon: <FiCheckCircle className="h-4 w-4" />,
      label: 'Secure'
    }
  };

  const config = levelConfig[level] || levelConfig.medium;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} ${config.bgColor}`}>
      {config.icon}
      <span className="ml-1">{config.label}</span>
    </span>
  );
};

SecurityBadge.propTypes = {
  level: PropTypes.oneOf(['critical', 'high', 'medium', 'low', 'secure'])
};

export default SecurityBadge;