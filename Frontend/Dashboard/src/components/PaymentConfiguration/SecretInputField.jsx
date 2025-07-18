
import React from 'react';
import { FiEye, FiEyeOff, FiCopy } from 'react-icons/fi';
import PropTypes from 'prop-types';

/**
 * Input field for sensitive data with visibility toggle and copy functionality.
 */
const SecretInputField = ({
  value,
  onChange,
  name,
  index,
  showSecret,
  toggleSecretVisibility,
  copyToClipboard,
  placeholder,
  label,
  required = false,
}) => (
  <div>
    <label htmlFor={`${name}-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        id={`${name}-${index}`}
        type={showSecret ? 'text' : 'password'}
        name={name}
        value={value || ''}
        onChange={(e) => onChange(index, e)}
        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => toggleSecretVisibility(index)}
        className="absolute inset-y-0 right-10 pr-3 flex items-center text-gray-500 hover:text-gray-700"
      >
        {showSecret ? <FiEyeOff /> : <FiEye />}
      </button>
      <button
        type="button"
        onClick={() => copyToClipboard(value)}
        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
        title="Copy to clipboard"
      >
        <FiCopy />
      </button>
    </div>
  </div>
);

SecretInputField.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  showSecret: PropTypes.bool,
  toggleSecretVisibility: PropTypes.func.isRequired,
  copyToClipboard: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,
};

export default SecretInputField;