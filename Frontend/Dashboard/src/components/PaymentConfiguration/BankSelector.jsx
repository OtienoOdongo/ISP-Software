


import React from 'react';
import PropTypes from 'prop-types';

/**
 * Dropdown for selecting a Kenyan bank.
 */
export const BankSelector = ({ value, onChange, index, banks }) => (
  <div>
    <label htmlFor={`bank_name-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
      Bank Name
      <span className="text-red-500">*</span>
    </label>
    <select
      id={`bank_name-${index}`}
      name="bank_name"
      value={value || ''}
      onChange={onChange}
      className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:ring-2"
    >
      <option value="">Select Bank</option>
      {banks.map((bank, i) => (
        <option key={i} value={bank.name}>{bank.name} ({bank.code})</option>
      ))}
    </select>
  </div>
);

BankSelector.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  banks: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired
    })
  ).isRequired
};

export default BankSelector;