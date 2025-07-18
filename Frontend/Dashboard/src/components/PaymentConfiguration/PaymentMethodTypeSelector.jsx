


import React from 'react';
import PropTypes from 'prop-types';
import { PAYMENT_METHODS } from './Utils/paymentConstants';

/**
 * Dropdown for selecting payment method type.
 */
const PaymentMethodTypeSelector = ({ value, onChange, index }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
  >
    {Object.values(PAYMENT_METHODS).map((methodOption, i) => (
      <option key={i} value={methodOption.value}>{methodOption.label}</option>
    ))}
  </select>
);

PaymentMethodTypeSelector.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
};

export default PaymentMethodTypeSelector;