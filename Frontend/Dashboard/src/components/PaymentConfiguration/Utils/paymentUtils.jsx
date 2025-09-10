


// import { PAYMENT_METHODS } from './paymentConstants';
// import { FiSmartphone, FiDollarSign, FiHome, FiCreditCard } from 'react-icons/fi';

// /**
//  * Returns the icon for a payment method.
//  * @param {string} type - The payment method type (e.g., 'mpesa_paybill').
//  * @returns {JSX.Element} The icon component.
//  */
// export const getMethodIcon = (type) => {
//   const method = Object.values(PAYMENT_METHODS).find(m => m.value === type);
//   const color = method ? method.color.split(' ').find(c => c.startsWith('text-')) : 'text-gray-800';
  
//   switch (type) {
//     case PAYMENT_METHODS.MPESA_PAYBILL.value:
//     case PAYMENT_METHODS.MPESA_TILL.value:
//       return <FiSmartphone className={color} />;
//     case PAYMENT_METHODS.PAYPAL.value:
//       return <FiDollarSign className={color} />;
//     case PAYMENT_METHODS.BANK.value:
//       return <FiHome className={color} />;
//     default:
//       return <FiCreditCard className="text-gray-800" />;
//   }
// };

// /**
//  * Returns the label for a payment method.
//  * @param {string} type - The payment method type.
//  * @returns {string} The method label.
//  */
// export const getMethodLabel = (type) => {
//   const method = Object.values(PAYMENT_METHODS).find(m => m.value === type);
//   return method ? method.label : 'Payment Method';
// };

// /**
//  * Returns the color classes for a payment method.
//  * @param {string} type - The payment method type.
//  * @returns {string} Tailwind CSS color classes.
//  */
// export const getMethodColor = (type) => {
//   const method = Object.values(PAYMENT_METHODS).find(m => m.value === type);
//   return method ? method.color : 'bg-gray-100 text-gray-800';
// };

// export const getMethodGradient = (type) => {
//   const method = Object.values(PAYMENT_METHODS).find(m => m.value === type);
//   return method ? method.gradient : 'from-gray-600 to-gray-500';
// };

// /**
//  * Normalizes a Kenyan phone number to +254 format.
//  * @param {string} phone - The phone number.
//  * @returns {string} The normalized phone number.
//  * @throws {Error} If the phone number format is invalid.
//  */
// export const formatPhoneNumber = (phone) => {
//   if (!phone) return '';

//   const cleanedPhone = phone.replace(/\s+/g, '');

//   if (cleanedPhone.startsWith('+254') && cleanedPhone.length === 13 && /^\+254\d{9}$/.test(cleanedPhone)) {
//     return cleanedPhone;
//   } else if (cleanedPhone.startsWith('254') && cleanedPhone.length === 12 && /^254\d{9}$/.test(cleanedPhone)) {
//     return `+${cleanedPhone}`;
//   } else if (cleanedPhone.startsWith('07') && cleanedPhone.length === 10 && /^07\d{8}$/.test(cleanedPhone)) {
//     return `+254${cleanedPhone.substring(1)}`;
//   } else if (cleanedPhone.startsWith('7') && cleanedPhone.length === 9 && /^7\d{8}$/.test(cleanedPhone)) {
//     return `+254${cleanedPhone}`;
//   } else if (cleanedPhone.startsWith('0') && cleanedPhone.length === 10 && /^0\d{9}$/.test(cleanedPhone)) {
//     return `+254${cleanedPhone.substring(1)}`;
//   } else {
//     throw new Error('Invalid phone number format. Use 07XXXXXXXX, 2547XXXXXXXX, or +2547XXXXXXXX.');
//   }
// };

// /**
//  * Returns the metadata for a payment method.
//  * @param {string} methodType - The payment method type.
//  * @returns {Object} The method metadata.
//  */
// export const getMethodMetadata = (methodType) => {
//   return PAYMENT_METHODS[Object.keys(PAYMENT_METHODS).find(key => PAYMENT_METHODS[key].value === methodType)] || {};
// };






import { PAYMENT_METHODS } from './paymentConstants';
import { FiSmartphone, FiDollarSign, FiHome, FiCreditCard } from 'react-icons/fi';

export const getMethodIcon = (type) => {
  const method = Object.values(PAYMENT_METHODS).find(m => m.value === type);
  return method ? method.icon : <FiCreditCard className="text-gray-500" />;
};

export const getMethodLabel = (type) => {
  const method = Object.values(PAYMENT_METHODS).find(m => m.value === type);
  return method ? method.label : 'Payment Method';
};

export const getMethodColor = (type) => {
  const method = Object.values(PAYMENT_METHODS).find(m => m.value === type);
  return method ? method.color : 'bg-gray-100 text-gray-800';
};

export const getMethodGradient = (type) => {
  const method = Object.values(PAYMENT_METHODS).find(m => m.value === type);
  return method ? method.gradient : 'from-gray-500 to-gray-600';
};

export const getMethodMetadata = (type) => {
  return Object.values(PAYMENT_METHODS).find(m => m.value === type) || {};
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('254') && cleaned.length === 12) return `+${cleaned}`;
  if (cleaned.startsWith('7') && cleaned.length === 9) return `+254${cleaned}`;
  if (cleaned.startsWith('0') && cleaned.length === 10) return `+254${cleaned.substring(1)}`;
  
  return phone;
};