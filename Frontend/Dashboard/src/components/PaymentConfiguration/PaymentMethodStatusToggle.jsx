
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Toggle switch for enabling/disabling a payment method.
 */
const PaymentMethodStatusToggle = ({ isActive, onChange, index }) => (
  <label className="flex items-center cursor-pointer">
    <div className="relative">
      <input
        type="checkbox"
        name="is_active"
        checked={isActive}
        onChange={(e) => onChange(index, e)}
        className="sr-only"
      />
      <div className={`block w-10 h-6 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${isActive ? 'transform translate-x-4' : ''}`}></div>
    </div>
    <div className="ml-3 text-sm font-medium text-gray-700">
      Enable Method
    </div>
  </label>
);

PaymentMethodStatusToggle.propTypes = {
  isActive: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
};

export default PaymentMethodStatusToggle;