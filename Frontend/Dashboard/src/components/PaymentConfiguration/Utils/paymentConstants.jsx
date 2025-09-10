
// import { FiSmartphone, FiGlobe, FiCreditCard } from 'react-icons/fi';



// /**
//  * Payment methods configuration for M-Pesa, PayPal, and Bank transfer.
//  * @type {Object.<string, {value: string, label: string, color: string, gradient: string, description: string, supportedCurrencies: string[], feeStructure: string, documentationLink: string}>}
//  */
 


// export const PAYMENT_METHODS = {
//   MPESA_PAYBILL: {
//     value: 'mpesa_paybill',
//     label: 'M-Pesa Paybill',
//     color: 'bg-purple-100 text-purple-800',
//     gradient: 'from-purple-500 to-purple-600',
//     description: 'Accept payments via M-Pesa Paybill number',
//     supportedCurrencies: ['KES'],
//     feeStructure: '1.5% + KES 10 per transaction',
//     documentationLink: 'https://developer.safaricom.co.ke/docs'
//   },
//   MPESA_TILL: {
//     value: 'mpesa_till',
//     label: 'M-Pesa Till',
//     color: 'bg-green-100 text-green-800',
//     gradient: 'from-green-500 to-green-600',
//     description: 'Accept payments via M-Pesa Till number and store number',
//     supportedCurrencies: ['KES'],
//     feeStructure: '1.2% + KES 5 per transaction',
//     documentationLink: 'https://developer.safaricom.co.ke/docs'
//   },
//   PAYPAL: {
//     value: 'paypal',
//     label: 'PayPal',
//     color: 'bg-blue-100 text-blue-800',
//     gradient: 'from-blue-500 to-blue-600',
//     description: 'Accept international payments via PayPal',
//     supportedCurrencies: ['USD', 'EUR', 'GBP', 'AUD', 'CAD'],
//     feeStructure: '2.9% + $0.30 per transaction',
//     documentationLink: 'https://developer.paypal.com/docs'
//   },
//   BANK: {
//     value: 'bank',
//     label: 'Bank Transfer',
//     color: 'bg-indigo-100 text-indigo-800',
//     gradient: 'from-indigo-500 to-indigo-600',
//     description: 'Accept direct bank transfers',
//     supportedCurrencies: ['KES', 'USD', 'EUR', 'GBP'],
//     feeStructure: 'Flat fee of KES 50 per transaction',
//     documentationLink: 'https://buni.kcbgroup.com/discover-apis'
//   }
// };

// /**
//  * Security levels for recommendations and badges.
//  * @type {{value: string, label: string, color: string}[]}
//  */
// export const SECURITY_LEVELS = [
//   { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
//   { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
//   { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
//   { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
//   { value: 'secure', label: 'Secure', color: 'bg-green-100 text-green-800' }
// ];

// /**
//  * List of Kenyan banks for bank transfer configurations.
//  * @type {{name: string, code: string}[]}
//  */
// export const KENYAN_BANKS = [
//   { name: 'Equity Bank', code: '68' },
//   { name: 'KCB Bank', code: '01' },
//   { name: 'Cooperative Bank', code: '11' },
//   { name: 'Standard Chartered', code: '02' },
//   { name: 'Absa Bank', code: '03' },
//   { name: 'NCBA Bank', code: '07' },
//   { name: 'DTB Bank', code: '63' },
//   { name: 'I&M Bank', code: '57' },
//   { name: 'Stanbic Bank', code: '31' },
//   { name: 'Citi Bank', code: '04' },
//   { name: 'Bank of Africa', code: '55' },
//   { name: 'Sidian Bank', code: '66' },
//   { name: 'Prime Bank', code: '40' },
//   { name: 'Family Bank', code: '70' },
//   { name: 'GT Bank', code: '53' }
// ];

// /**
//  * Returns the security level configuration.
//  * @param {string} level - The security level (e.g., 'critical').
//  * @returns {{value: string, label: string, color: string}} The security level object.
//  */
// export const getSecurityLevel = (level) => {
//   return SECURITY_LEVELS.find(sl => sl.value === level) || { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
// };

// export const PAYMENT_METHOD_TYPES = [
//   { value: 'mpesa', label: 'M-Pesa', icon: FiSmartphone, color: 'bg-green-100 text-green-800' },
//   { value: 'paypal', label: 'PayPal', icon: FiGlobe, color: 'bg-blue-100 text-blue-800' },
//   { value: 'bank', label: 'Bank Transfer', icon: FiCreditCard, color: 'bg-purple-100 text-purple-800' }
// ];





import { FiSmartphone, FiDollarSign, FiHome, FiCreditCard } from 'react-icons/fi';

export const PAYMENT_METHODS = {
  MPESA_PAYBILL: {
    value: 'mpesa_paybill',
    label: 'M-Pesa Paybill',
    icon: <FiSmartphone className="text-purple-500" />,
    color: 'bg-purple-100 text-purple-800',
    gradient: 'from-purple-500 to-purple-600',
    description: 'Accept payments via M-Pesa Paybill number',
    supportedCurrencies: ['KES'],
    feeStructure: '1.5% + KES 10 per transaction',
    documentationLink: 'https://developer.safaricom.co.ke/docs'
  },
  MPESA_TILL: {
    value: 'mpesa_till',
    label: 'M-Pesa Till',
    icon: <FiSmartphone className="text-green-500" />,
    color: 'bg-green-100 text-green-800',
    gradient: 'from-green-500 to-green-600',
    description: 'Accept payments via M-Pesa Till number',
    supportedCurrencies: ['KES'],
    feeStructure: '1.2% + KES 5 per transaction',
    documentationLink: 'https://developer.safaricom.co.ke/docs'
  },
  PAYPAL: {
    value: 'paypal',
    label: 'PayPal',
    icon: <FiDollarSign className="text-blue-500" />,
    color: 'bg-blue-100 text-blue-800',
    gradient: 'from-blue-500 to-blue-600',
    description: 'Accept international payments',
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    feeStructure: '2.9% + $0.30 per transaction',
    documentationLink: 'https://developer.paypal.com/docs'
  },
  BANK: {
    value: 'bank',
    label: 'Bank Transfer',
    icon: <FiHome className="text-indigo-500" />,
    color: 'bg-indigo-100 text-indigo-800',
    gradient: 'from-indigo-500 to-indigo-600',
    description: 'Accept direct bank transfers',
    supportedCurrencies: ['KES', 'USD', 'EUR'],
    feeStructure: 'Flat fee of KES 50 per transaction',
    documentationLink: 'https://bankingapi.com/docs'
  }
};

export const SECURITY_LEVELS = [
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800', icon: 'FiAlertTriangle' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800', icon: 'FiAlertCircle' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800', icon: 'FiShield' },
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800', icon: 'FiShield' },
  { value: 'secure', label: 'Secure', color: 'bg-green-100 text-green-800', icon: 'FiCheckCircle' }
];

export const KENYAN_BANKS = [
  { name: 'Equity Bank', code: '68' },
  { name: 'KCB Bank', code: '01' },
  { name: 'Cooperative Bank', code: '11' },
  { name: 'Standard Chartered', code: '02' },
  { name: 'Absa Bank', code: '03' },
  { name: 'NCBA Bank', code: '07' },
  { name: 'DTB Bank', code: '63' },
  { name: 'I&M Bank', code: '57' },
  { name: 'Stanbic Bank', code: '31' },
  { name: 'Citi Bank', code: '04' },
  { name: 'Bank of Africa', code: '55' },
  { name: 'Sidian Bank', code: '66' },
  { name: 'Prime Bank', code: '40' },
  { name: 'Family Bank', code: '70' },
  { name: 'GT Bank', code: '53' }
];

export const getSecurityLevel = (level) => {
  return SECURITY_LEVELS.find(sl => sl.value === level) || SECURITY_LEVELS[2]; // Default to medium
};