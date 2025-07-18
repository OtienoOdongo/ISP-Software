import React from 'react';
import PropTypes from 'prop-types';
import { FiShield, FiAlertTriangle, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { getSecurityLevel, SECURITY_LEVELS } from '../PaymentConfiguration/Utils/paymentConstants'

/**
 * Renders a badge indicating the security level with an icon and label.
 * @param {Object} props - Component props.
 * @param {string} props.level - Security level ('critical', 'high', 'medium', 'low', 'secure').
 * @returns {JSX.Element} The security badge component.
 */
const SecurityBadge = ({ level = 'medium' }) => {
  // Map security levels to icons
  const getLevelIcon = (levelValue) => {
    switch (levelValue) {
      case 'critical':
        return <FiAlertTriangle className="h-4 w-4" />;
      case 'high':
        return <FiAlertCircle className="h-4 w-4" />;
      case 'medium':
      case 'low':
        return <FiShield className="h-4 w-4" />;
      case 'secure':
        return <FiCheckCircle className="h-4 w-4" />;
      default:
        return <FiShield className="h-4 w-4" />;
    }
  };

  // Get configuration for the level
  const config = getSecurityLevel(level);
  const icon = getLevelIcon(config.value);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      {icon}
      <span className="ml-1">{config.label}</span>
    </span>
  );
};

// Derive PropTypes from SECURITY_LEVELS
SecurityBadge.propTypes = {
  level: PropTypes.oneOf(SECURITY_LEVELS.map((sl) => sl.value)),
};

export default SecurityBadge;