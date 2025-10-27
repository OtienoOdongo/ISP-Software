


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