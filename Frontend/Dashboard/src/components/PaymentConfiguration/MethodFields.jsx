







// // src/components/PaymentConfiguration/MethodFields.jsx
// import React from 'react';
// import {
//   FiLock,
//   FiShield,
//   FiEye,
//   FiEyeOff,
//   FiInfo
// } from 'react-icons/fi';
// import AdvancedSettings from './AdvancedSettings';
// import BankSelector from './BankSelector';
// import WebhookConfiguration from './WebhookConfiguration';
// import TestConnectionButton from './TestConnectionButton';
// import SecurityBadge from './SecurityBadge';
// import SimpleMpesaConfig from './SimpleMpesaConfig';
// import { getMethodMetadata, getMethodGradient } from './Utils/paymentUtils';

// const MethodFields = ({
//   method,
//   index,
//   validationErrors,
//   showSecrets,
//   showAdvanced,
//   onChange,
//   onToggleSecret,
//   onToggleAdvanced,
//   onGenerateCallback,
//   onCopyToClipboard,
//   theme = 'light'
// }) => {
//   const methodInfo = getMethodMetadata(method.type);
  
//   // Theme-based CSS classes
//   const cardClass = theme === 'dark'
//     ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700 shadow-lg'
//     : 'bg-white border border-gray-200 shadow-md';

//   const inputClass = theme === 'dark'
//     ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
//     : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

//   const titleClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
//   const textClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
//   const labelClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
//   const errorClass = 'text-red-500 text-xs mt-1';

//   // DEBUG: Log the method data to see what's being received
//   console.log(`🔍 MethodFields DEBUG - method type: ${method.type}`, method);

//   const renderMethodSpecificFields = () => {
//     switch(method.type) {
//       case 'mpesa_paybill':
//         return (
//           <div className="space-y-4">
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Paybill Number <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="shortCode"
//                 value={method.shortCode || ''}
//                 onChange={(e) => onChange(index, e)}
//                 className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                 placeholder="123456"
//               />
//               {validationErrors[`${index}-shortCode`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-shortCode`]}</p>
//               )}
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Consumer Key <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={showSecrets ? "text" : "password"}
//                   name="consumerKey"
//                   value={method.consumerKey || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
//                   placeholder="your_consumer_key_here"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onToggleSecret(index)}
//                   className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
//                     theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
//                 </button>
//               </div>
//               {validationErrors[`${index}-consumerKey`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-consumerKey`]}</p>
//               )}
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Consumer Secret <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={showSecrets ? "text" : "password"}
//                   name="consumerSecret"
//                   value={method.consumerSecret || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
//                   placeholder="your_consumer_secret_here"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onToggleSecret(index)}
//                   className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
//                     theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
//                 </button>
//               </div>
//               {validationErrors[`${index}-consumerSecret`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-consumerSecret`]}</p>
//               )}
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Pass Key <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={showSecrets ? "text" : "password"}
//                   name="passKey"
//                   value={method.passKey || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
//                   placeholder="bfb279f9aa9bdbcf..."
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onToggleSecret(index)}
//                   className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
//                     theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
//                 </button>
//               </div>
//               {validationErrors[`${index}-passKey`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-passKey`]}</p>
//               )}
//             </div>
//           </div>
//         );

//       case 'mpesa_till':
//         return (
//           <div className="space-y-4">
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Till Number <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="tillNumber"
//                 value={method.tillNumber || method.shortCode || ''}
//                 onChange={(e) => onChange(index, e)}
//                 className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                 placeholder="1234567"
//               />
//               {validationErrors[`${index}-tillNumber`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-tillNumber`]}</p>
//               )}
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Consumer Key <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={showSecrets ? "text" : "password"}
//                   name="consumerKey"
//                   value={method.consumerKey || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
//                   placeholder="your_consumer_key_here"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onToggleSecret(index)}
//                   className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
//                     theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
//                 </button>
//               </div>
//               {validationErrors[`${index}-consumerKey`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-consumerKey`]}</p>
//               )}
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Consumer Secret <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={showSecrets ? "text" : "password"}
//                   name="consumerSecret"
//                   value={method.consumerSecret || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
//                   placeholder="your_consumer_secret_here"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onToggleSecret(index)}
//                   className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
//                     theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
//                 </button>
//               </div>
//               {validationErrors[`${index}-consumerSecret`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-consumerSecret`]}</p>
//               )}
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Pass Key <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={showSecrets ? "text" : "password"}
//                   name="passKey"
//                   value={method.passKey || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
//                   placeholder="bfb279f9aa9bdbcf..."
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onToggleSecret(index)}
//                   className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
//                     theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
//                 </button>
//               </div>
//               {validationErrors[`${index}-passKey`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-passKey`]}</p>
//               )}
//             </div>
//           </div>
//         );

//       case 'paypal':
//         return (
//           <div className="space-y-4">
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Client ID <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={showSecrets ? "text" : "password"}
//                   name="clientId"
//                   value={method.clientId || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
//                   placeholder="AeA9Q3hL9L1dL8QJ6..."
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onToggleSecret(index)}
//                   className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
//                     theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
//                 </button>
//               </div>
//               {validationErrors[`${index}-clientId`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-clientId`]}</p>
//               )}
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Secret <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={showSecrets ? "text" : "password"}
//                   name="secret"
//                   value={method.secret || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
//                   placeholder="EC-9QJ8QJ7QJ6QJ5..."
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onToggleSecret(index)}
//                   className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
//                     theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
//                 </button>
//               </div>
//               {validationErrors[`${index}-secret`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-secret`]}</p>
//               )}
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Merchant ID
//               </label>
//               <input
//                 type="text"
//                 name="merchantId"
//                 value={method.merchantId || ''}
//                 onChange={(e) => onChange(index, e)}
//                 className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                 placeholder="MERCHANT123456"
//               />
//             </div>
//           </div>
//         );

//       case 'bank_transfer':
//         console.log('🔍 Rendering bank_transfer fields with data:', method);
//         return (
//           <div className="space-y-4">
//             {/* Debug info - remove after testing */}
//             {process.env.NODE_ENV === 'development' && (
//               <div className="p-3 bg-yellow-100 border border-yellow-400 rounded">
//                 <p className="text-sm font-medium text-yellow-800">Debug Info:</p>
//                 <pre className="text-xs mt-1 text-yellow-700">
//                   {JSON.stringify({
//                     bankName: method.bankName,
//                     accountNumber: method.accountNumber,
//                     accountName: method.accountName,
//                     hasBankData: !!method.bankName
//                   }, null, 2)}
//                 </pre>
//               </div>
//             )}
            
//             <BankSelector
//               value={method.bankName || ''}
//               onChange={(e) => onChange(index, e)}
//               index={index}
//               theme={theme}
//             />
//             {validationErrors[`${index}-bankName`] && (
//               <p className={errorClass}>{validationErrors[`${index}-bankName`]}</p>
//             )}
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                   Account Number <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="accountNumber"
//                   value={method.accountNumber || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                   placeholder="1234567890"
//                 />
//                 {validationErrors[`${index}-accountNumber`] && (
//                   <p className={errorClass}>{validationErrors[`${index}-accountNumber`]}</p>
//                 )}
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                   Account Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="accountName"
//                   value={method.accountName || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                   placeholder="John Doe"
//                 />
//                 {validationErrors[`${index}-accountName`] && (
//                   <p className={errorClass}>{validationErrors[`${index}-accountName`]}</p>
//                 )}
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                   Branch Code
//                 </label>
//                 <input
//                   type="text"
//                   name="branchCode"
//                   value={method.branchCode || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                   placeholder="123"
//                 />
//                 {validationErrors[`${index}-branchCode`] && (
//                   <p className={errorClass}>{validationErrors[`${index}-branchCode`]}</p>
//                 )}
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                   SWIFT Code
//                 </label>
//                 <input
//                   type="text"
//                   name="swiftCode"
//                   value={method.swiftCode || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                   placeholder="ABCDKENA"
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                   IBAN
//                 </label>
//                 <input
//                   type="text"
//                   name="iban"
//                   value={method.iban || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                   placeholder="KE123456789012345678901234"
//                 />
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                   Routing Number
//                 </label>
//                 <input
//                   type="text"
//                   name="routingNumber"
//                   value={method.routingNumber || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                   placeholder="021000021"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Bank Address
//               </label>
//               <textarea
//                 name="bankAddress"
//                 value={method.bankAddress || ''}
//                 onChange={(e) => onChange(index, e)}
//                 rows={3}
//                 className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                 placeholder="Bank Street, Nairobi, Kenya"
//               />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                   Account Type
//                 </label>
//                 <select
//                   name="accountType"
//                   value={method.accountType || 'checking'}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                 >
//                   <option value="checking">Checking Account</option>
//                   <option value="savings">Savings Account</option>
//                   <option value="business">Business Account</option>
//                   <option value="corporate">Corporate Account</option>
//                 </select>
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                   Currency
//                 </label>
//                 <select
//                   name="currency"
//                   value={method.currency || 'KES'}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                 >
//                   <option value="KES">Kenyan Shilling (KES)</option>
//                   <option value="USD">US Dollar (USD)</option>
//                   <option value="EUR">Euro (EUR)</option>
//                   <option value="GBP">British Pound (GBP)</option>
//                 </select>
//               </div>
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Bank Code
//               </label>
//               <input
//                 type="text"
//                 name="bankCode"
//                 value={method.bankCode || ''}
//                 onChange={(e) => onChange(index, e)}
//                 className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                 placeholder="Bank institution code"
//               />
//             </div>
//           </div>
//         );

//       default:
//         console.warn(`Unknown method type: ${method.type}`, method);
//         return (
//           <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
//             <FiInfo className="h-12 w-12 mx-auto mb-3 opacity-50" />
//             <p>No specific configuration required for this payment method.</p>
//             <p className="text-sm mt-1">Basic settings are available in Advanced Settings.</p>
//             {/* Debug info */}
//             <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
//               <p>Method Type: {method.type}</p>
//               <p>Method Data: {JSON.stringify(method)}</p>
//             </div>
//           </div>
//         );
//     }
//   };

//   const renderSecurityRecommendations = () => {
//     const baseRecommendations = [
//       { level: "high", text: "Rotate API keys every 90 days" },
//       { level: "critical", text: "Never commit secrets to version control" },
//       { level: "medium", text: "Restrict IP access to payment endpoints" },
//       { level: "medium", text: "Enable two-factor authentication where available" }
//     ];

//     const methodSpecificRecommendations = {
//       mpesa_paybill: [
//         { level: "high", text: "Keep passkey secure and encrypted" },
//         { level: "medium", text: "Monitor transaction logs regularly" },
//         { level: "medium", text: "Use different credentials for sandbox and production" }
//       ],
//       mpesa_till: [
//         { level: "high", text: "Keep passkey secure and encrypted" },
//         { level: "medium", text: "Monitor transaction logs regularly" },
//         { level: "medium", text: "Use different credentials for sandbox and production" }
//       ],
//       paypal: [
//         { level: "high", text: "Enable two-factor authentication on PayPal account" },
//         { level: "medium", text: "Use strong, unique passwords" },
//         { level: "medium", text: "Regularly review API access logs" }
//       ],
//       bank_transfer: [
//         { level: "high", text: "Keep bank account details secure and encrypted" },
//         { level: "medium", text: "Regularly monitor bank transactions" },
//         { level: "medium", text: "Use secure channels for sharing bank details" },
//         { level: "medium", text: "Implement dual authorization for large transfers" }
//       ]
//     };

//     const allRecommendations = [
//       ...baseRecommendations,
//       ...(methodSpecificRecommendations[method.type] || [])
//     ];

//     return (
//       <div className="space-y-3">
//         {allRecommendations.map((rec, idx) => (
//           <div key={idx} className="flex items-start">
//             <div className="flex-shrink-0 mt-0.5">
//               <SecurityBadge level={rec.level} theme={theme} />
//             </div>
//             <span className={`ml-3 text-sm ${textClass}`}>{rec.text}</span>
//           </div>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-6">
//       {/* Method header */}
//       <div className={`p-6 rounded-xl bg-gradient-to-r ${getMethodGradient(method.type)} text-white shadow-lg transition-all duration-300`}>
//         <div className="flex flex-col sm:flex-row sm:items-start gap-4">
//           <div className="flex-shrink-0 p-3 bg-white bg-opacity-20 rounded-xl">
//             {methodInfo.icon}
//           </div>
//           <div className="flex-1">
//             <h3 className="text-xl font-semibold">{methodInfo.label}</h3>
//             <p className="mt-1 text-blue-100 opacity-90">{methodInfo.description}</p>
//             <div className="mt-3 flex flex-wrap gap-2">
//               <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
//                 Currencies: {methodInfo.supportedCurrencies?.join(', ') || 'Multiple'}
//               </span>
//               <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
//                 Fees: {methodInfo.feeStructure || 'Varies'}
//               </span>
//               {methodInfo.documentationLink && (
//                 <a 
//                   href={methodInfo.documentationLink} 
//                   target="_blank" 
//                   rel="noopener noreferrer"
//                   className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-colors"
//                 >
//                   View Documentation
//                 </a>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Left Column - Credentials & Advanced Settings */}
//         <div className="space-y-6">
//           {/* Credentials Section */}
//           <div className={`p-6 rounded-xl ${cardClass} transition-colors duration-300`}>
//             <h3 className={`text-lg font-medium mb-4 flex items-center ${titleClass}`}>
//               <FiLock className={`mr-2 ${theme === 'dark' ? 'text-indigo-400' : 'text-blue-500'}`} />
//               Credentials
//             </h3>
//             {renderMethodSpecificFields()}
//           </div>

//           {/* Advanced Settings Component */}
//           <AdvancedSettings
//             method={method}
//             index={index}
//             showAdvanced={showAdvanced}
//             toggleAdvancedSettings={onToggleAdvanced}
//             handleChange={onChange}
//             showSecrets={showSecrets}
//             toggleSecretVisibility={onToggleSecret}
//             copyToClipboard={onCopyToClipboard}
//             theme={theme}
//           />
//         </div>
        
//         {/* Right Column - Webhook, M-Pesa Config & Security */}
//         <div className="space-y-6">
//           {/* Webhook Configuration Component */}
//           <WebhookConfiguration
//             callbackUrl={method.callbackURL}
//             onChange={(e) => onChange(index, e)}
//             index={index}
//             generateCallbackUrl={onGenerateCallback}
//             testConnection={
//               <TestConnectionButton 
//                 methodType={method.type} 
//                 gatewayId={method.id}
//                 callbackUrl={method.callbackURL}
//                 theme={theme}
//               />
//             }
//             copyToClipboard={onCopyToClipboard}
//             theme={theme}
//           />
          
//           {/* M-Pesa Simple Config Component */}
//           {(method.type === 'mpesa_paybill' || method.type === 'mpesa_till') && (
//             <SimpleMpesaConfig method={method} theme={theme} />
//           )}

//           {/* Security Recommendations */}
//           <div className={`p-6 rounded-xl ${cardClass} transition-colors duration-300`}>
//             <h3 className={`text-lg font-medium mb-4 flex items-center ${titleClass}`}>
//               <FiShield className={`mr-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
//               Security Recommendations
//             </h3>
//             {renderSecurityRecommendations()}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MethodFields;










// // src/components/PaymentConfiguration/MethodFields.jsx
// import React from 'react';
// import {
//   FiLock,
//   FiShield,
//   FiEye,
//   FiEyeOff,
//   FiInfo
// } from 'react-icons/fi';
// import AdvancedSettings from './AdvancedSettings';
// import BankSelector from './BankSelector';
// import WebhookConfiguration from './WebhookConfiguration';
// import TestConnectionButton from './TestConnectionButton';
// import SecurityBadge from './SecurityBadge';
// import SimpleMpesaConfig from './SimpleMpesaConfig';
// import { getMethodMetadata, getMethodGradient } from './Utils/paymentUtils';
// import { EnhancedSelect, getThemeClasses } from '../ServiceManagement/Shared/components'

// const MethodFields = ({
//   method,
//   index,
//   validationErrors,
//   showSecrets,
//   showAdvanced,
//   onChange,
//   onToggleSecret,
//   onToggleAdvanced,
//   onGenerateCallback,
//   onCopyToClipboard,
//   theme = 'light'
// }) => {
//   const methodInfo = getMethodMetadata(method.type);
//   const themeClasses = getThemeClasses(theme);
  
//   // Theme-based CSS classes
//   const cardClass = theme === 'dark'
//     ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700 shadow-lg'
//     : 'bg-white border border-gray-200 shadow-md';

//   const inputClass = theme === 'dark'
//     ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
//     : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

//   const titleClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
//   const textClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
//   const labelClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
//   const errorClass = 'text-red-500 text-xs mt-1';

//   // EnhancedSelect handler
//   const handleEnhancedSelectChange = (fieldName) => (selectedValue) => {
//     const syntheticEvent = {
//       target: {
//         name: fieldName,
//         value: selectedValue
//       }
//     };
//     onChange(syntheticEvent);
//   };

//   const renderMethodSpecificFields = () => {
//     switch(method.type) {
//       case 'mpesa_paybill':
//         return (
//           <div className="space-y-4">
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Paybill Number <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="shortCode"
//                 value={method.shortCode || ''}
//                 onChange={(e) => onChange(index, e)}
//                 className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                 placeholder="123456"
//               />
//               {validationErrors[`${index}-shortCode`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-shortCode`]}</p>
//               )}
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Consumer Key <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={showSecrets[index] ? "text" : "password"}
//                   name="consumerKey"
//                   value={method.consumerKey || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
//                   placeholder="your_consumer_key_here"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onToggleSecret(index)}
//                   className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
//                     theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
//                 </button>
//               </div>
//               {validationErrors[`${index}-consumerKey`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-consumerKey`]}</p>
//               )}
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Consumer Secret <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={showSecrets[index] ? "text" : "password"}
//                   name="consumerSecret"
//                   value={method.consumerSecret || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
//                   placeholder="your_consumer_secret_here"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onToggleSecret(index)}
//                   className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
//                     theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
//                 </button>
//               </div>
//               {validationErrors[`${index}-consumerSecret`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-consumerSecret`]}</p>
//               )}
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Pass Key <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={showSecrets[index] ? "text" : "password"}
//                   name="passKey"
//                   value={method.passKey || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
//                   placeholder="bfb279f9aa9bdbcf..."
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onToggleSecret(index)}
//                   className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
//                     theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
//                 </button>
//               </div>
//               {validationErrors[`${index}-passKey`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-passKey`]}</p>
//               )}
//             </div>
//           </div>
//         );

//       case 'mpesa_till':
//         return (
//           <div className="space-y-4">
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Till Number <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="tillNumber"
//                 value={method.tillNumber || method.shortCode || ''}
//                 onChange={(e) => onChange(index, e)}
//                 className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                 placeholder="1234567"
//               />
//               {validationErrors[`${index}-tillNumber`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-tillNumber`]}</p>
//               )}
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Consumer Key <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={showSecrets[index] ? "text" : "password"}
//                   name="consumerKey"
//                   value={method.consumerKey || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
//                   placeholder="your_consumer_key_here"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onToggleSecret(index)}
//                   className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
//                     theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
//                 </button>
//               </div>
//               {validationErrors[`${index}-consumerKey`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-consumerKey`]}</p>
//               )}
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Consumer Secret <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={showSecrets[index] ? "text" : "password"}
//                   name="consumerSecret"
//                   value={method.consumerSecret || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
//                   placeholder="your_consumer_secret_here"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onToggleSecret(index)}
//                   className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
//                     theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
//                 </button>
//               </div>
//               {validationErrors[`${index}-consumerSecret`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-consumerSecret`]}</p>
//               )}
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Pass Key <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={showSecrets[index] ? "text" : "password"}
//                   name="passKey"
//                   value={method.passKey || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
//                   placeholder="bfb279f9aa9bdbcf..."
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onToggleSecret(index)}
//                   className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
//                     theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
//                 </button>
//               </div>
//               {validationErrors[`${index}-passKey`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-passKey`]}</p>
//               )}
//             </div>
//           </div>
//         );

//       case 'paypal':
//         return (
//           <div className="space-y-4">
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Client ID <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={showSecrets[index] ? "text" : "password"}
//                   name="clientId"
//                   value={method.clientId || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
//                   placeholder="AeA9Q3hL9L1dL8QJ6..."
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onToggleSecret(index)}
//                   className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
//                     theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
//                 </button>
//               </div>
//               {validationErrors[`${index}-clientId`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-clientId`]}</p>
//               )}
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Secret <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={showSecrets[index] ? "text" : "password"}
//                   name="secret"
//                   value={method.secret || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
//                   placeholder="EC-9QJ8QJ7QJ6QJ5..."
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onToggleSecret(index)}
//                   className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
//                     theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
//                 </button>
//               </div>
//               {validationErrors[`${index}-secret`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-secret`]}</p>
//               )}
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Merchant ID
//               </label>
//               <input
//                 type="text"
//                 name="merchantId"
//                 value={method.merchantId || ''}
//                 onChange={(e) => onChange(index, e)}
//                 className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                 placeholder="MERCHANT123456"
//               />
//             </div>
//           </div>
//         );

//       case 'bank_transfer':
//         return (
//           <div className="space-y-4">
//             <BankSelector
//               value={method.bankName || ''}
//               onChange={(e) => onChange(index, e)}
//               index={index}
//               theme={theme}
//             />
//             {validationErrors[`${index}-bankName`] && (
//               <p className={errorClass}>{validationErrors[`${index}-bankName`]}</p>
//             )}
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                   Account Number <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="accountNumber"
//                   value={method.accountNumber || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                   placeholder="1234567890"
//                 />
//                 {validationErrors[`${index}-accountNumber`] && (
//                   <p className={errorClass}>{validationErrors[`${index}-accountNumber`]}</p>
//                 )}
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                   Account Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="accountName"
//                   value={method.accountName || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                   placeholder="John Doe"
//                 />
//                 {validationErrors[`${index}-accountName`] && (
//                   <p className={errorClass}>{validationErrors[`${index}-accountName`]}</p>
//                 )}
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                   Branch Code
//                 </label>
//                 <input
//                   type="text"
//                   name="branchCode"
//                   value={method.branchCode || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                   placeholder="123"
//                 />
//                 {validationErrors[`${index}-branchCode`] && (
//                   <p className={errorClass}>{validationErrors[`${index}-branchCode`]}</p>
//                 )}
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                   SWIFT Code
//                 </label>
//                 <input
//                   type="text"
//                   name="swiftCode"
//                   value={method.swiftCode || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                   placeholder="ABCDKENA"
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                   IBAN
//                 </label>
//                 <input
//                   type="text"
//                   name="iban"
//                   value={method.iban || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                   placeholder="KE123456789012345678901234"
//                 />
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                   Routing Number
//                 </label>
//                 <input
//                   type="text"
//                   name="routingNumber"
//                   value={method.routingNumber || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                   placeholder="021000021"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Bank Address
//               </label>
//               <textarea
//                 name="bankAddress"
//                 value={method.bankAddress || ''}
//                 onChange={(e) => onChange(index, e)}
//                 rows={3}
//                 className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                 placeholder="Bank Street, Nairobi, Kenya"
//               />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                   Account Type
//                 </label>
//                 <EnhancedSelect
//                   value={method.accountType || 'checking'}
//                   onChange={handleEnhancedSelectChange('accountType')}
//                   options={[
//                     { value: 'checking', label: 'Checking Account' },
//                     { value: 'savings', label: 'Savings Account' },
//                     { value: 'business', label: 'Business Account' },
//                     { value: 'corporate', label: 'Corporate Account' }
//                   ]}
//                   placeholder="Select account type"
//                   className="w-full"
//                   theme={theme}
//                 />
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                   Currency
//                 </label>
//                 <EnhancedSelect
//                   value={method.currency || 'KES'}
//                   onChange={handleEnhancedSelectChange('currency')}
//                   options={[
//                     { value: 'KES', label: 'Kenyan Shilling (KES)' },
//                     { value: 'USD', label: 'US Dollar (USD)' },
//                     { value: 'EUR', label: 'Euro (EUR)' },
//                     { value: 'GBP', label: 'British Pound (GBP)' }
//                   ]}
//                   placeholder="Select currency"
//                   className="w-full"
//                   theme={theme}
//                 />
//               </div>
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Bank Code
//               </label>
//               <input
//                 type="text"
//                 name="bankCode"
//                 value={method.bankCode || ''}
//                 onChange={(e) => onChange(index, e)}
//                 className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                 placeholder="Bank institution code"
//               />
//             </div>
//           </div>
//         );

//       default:
//         return (
//           <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
//             <FiInfo className="h-12 w-12 mx-auto mb-3 opacity-50" />
//             <p>No specific configuration required for this payment method.</p>
//             <p className="text-sm mt-1">Basic settings are available in Advanced Settings.</p>
//           </div>
//         );
//     }
//   };

//   const renderSecurityRecommendations = () => {
//     const baseRecommendations = [
//       { level: "high", text: "Rotate API keys every 90 days" },
//       { level: "critical", text: "Never commit secrets to version control" },
//       { level: "medium", text: "Restrict IP access to payment endpoints" },
//       { level: "medium", text: "Enable two-factor authentication where available" }
//     ];

//     const methodSpecificRecommendations = {
//       mpesa_paybill: [
//         { level: "high", text: "Keep passkey secure and encrypted" },
//         { level: "medium", text: "Monitor transaction logs regularly" },
//         { level: "medium", text: "Use different credentials for sandbox and production" }
//       ],
//       mpesa_till: [
//         { level: "high", text: "Keep passkey secure and encrypted" },
//         { level: "medium", text: "Monitor transaction logs regularly" },
//         { level: "medium", text: "Use different credentials for sandbox and production" }
//       ],
//       paypal: [
//         { level: "high", text: "Enable two-factor authentication on PayPal account" },
//         { level: "medium", text: "Use strong, unique passwords" },
//         { level: "medium", text: "Regularly review API access logs" }
//       ],
//       bank_transfer: [
//         { level: "high", text: "Keep bank account details secure and encrypted" },
//         { level: "medium", text: "Regularly monitor bank transactions" },
//         { level: "medium", text: "Use secure channels for sharing bank details" },
//         { level: "medium", text: "Implement dual authorization for large transfers" }
//       ]
//     };

//     const allRecommendations = [
//       ...baseRecommendations,
//       ...(methodSpecificRecommendations[method.type] || [])
//     ];

//     return (
//       <div className="space-y-3">
//         {allRecommendations.map((rec, idx) => (
//           <div key={idx} className="flex items-start">
//             <div className="flex-shrink-0 mt-0.5">
//               <SecurityBadge level={rec.level} theme={theme} />
//             </div>
//             <span className={`ml-3 text-sm ${textClass}`}>{rec.text}</span>
//           </div>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-6">
//       {/* Method header */}
//       <div className={`p-6 rounded-xl bg-gradient-to-r ${getMethodGradient(method.type)} text-white shadow-lg transition-all duration-300`}>
//         <div className="flex flex-col sm:flex-row sm:items-start gap-4">
//           <div className="flex-shrink-0 p-3 bg-white bg-opacity-20 rounded-xl">
//             {methodInfo.icon}
//           </div>
//           <div className="flex-1">
//             <h3 className="text-xl font-semibold">{methodInfo.label}</h3>
//             <p className="mt-1 text-blue-100 opacity-90">{methodInfo.description}</p>
//             <div className="mt-3 flex flex-wrap gap-2">
//               <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
//                 Currencies: {methodInfo.supportedCurrencies?.join(', ') || 'Multiple'}
//               </span>
//               <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
//                 Fees: {methodInfo.feeStructure || 'Varies'}
//               </span>
//               {methodInfo.documentationLink && (
//                 <a 
//                   href={methodInfo.documentationLink} 
//                   target="_blank" 
//                   rel="noopener noreferrer"
//                   className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-colors"
//                 >
//                   View Documentation
//                 </a>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Left Column - Credentials & Advanced Settings */}
//         <div className="space-y-6">
//           {/* Credentials Section */}
//           <div className={`p-6 rounded-xl ${cardClass} transition-colors duration-300`}>
//             <h3 className={`text-lg font-medium mb-4 flex items-center ${titleClass}`}>
//               <FiLock className={`mr-2 ${theme === 'dark' ? 'text-indigo-400' : 'text-blue-500'}`} />
//               Credentials
//             </h3>
//             {renderMethodSpecificFields()}
//           </div>

//           {/* Advanced Settings Component */}
//           <AdvancedSettings
//             method={method}
//             index={index}
//             showAdvanced={showAdvanced}
//             toggleAdvancedSettings={onToggleAdvanced}
//             handleChange={onChange}
//             showSecrets={showSecrets}
//             toggleSecretVisibility={onToggleSecret}
//             copyToClipboard={onCopyToClipboard}
//             theme={theme}
//           />
//         </div>
        
//         {/* Right Column - Webhook, M-Pesa Config & Security */}
//         <div className="space-y-6">
//           {/* Webhook Configuration Component */}
//           <WebhookConfiguration
//             callbackUrl={method.callbackURL}
//             onChange={(e) => onChange(index, e)}
//             index={index}
//             generateCallbackUrl={onGenerateCallback}
//             testConnection={
//               <TestConnectionButton 
//                 methodType={method.type} 
//                 gatewayId={method.id}
//                 callbackUrl={method.callbackURL}
//                 theme={theme}
//               />
//             }
//             copyToClipboard={onCopyToClipboard}
//             theme={theme}
//           />
          
//           {/* M-Pesa Simple Config Component */}
//           {(method.type === 'mpesa_paybill' || method.type === 'mpesa_till') && (
//             <SimpleMpesaConfig method={method} theme={theme} />
//           )}

//           {/* Security Recommendations */}
//           <div className={`p-6 rounded-xl ${cardClass} transition-colors duration-300`}>
//             <h3 className={`text-lg font-medium mb-4 flex items-center ${titleClass}`}>
//               <FiShield className={`mr-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
//               Security Recommendations
//             </h3>
//             {renderSecurityRecommendations()}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MethodFields;













// // src/components/PaymentConfiguration/MethodFields.jsx
// import React from 'react';
// import {
//   FiLock,
//   FiShield,
//   FiEye,
//   FiEyeOff,
//   FiInfo
// } from 'react-icons/fi';
// import AdvancedSettings from './AdvancedSettings';
// import BankSelector from './BankSelector';
// import WebhookConfiguration from './WebhookConfiguration';
// import TestConnectionButton from './TestConnectionButton';
// import SecurityBadge from './SecurityBadge';
// import SimpleMpesaConfig from './SimpleMpesaConfig';
// import { getMethodMetadata, getMethodGradient } from './Utils/paymentUtils';
// import { EnhancedSelect, getThemeClasses } from '../ServiceManagement/Shared/components'

// const MethodFields = ({
//   method,
//   index,
//   validationErrors,
//   showSecrets,
//   showAdvanced,
//   onChange,
//   onToggleSecret,
//   onToggleAdvanced,
//   onGenerateCallback,
//   onCopyToClipboard,
//   theme = 'light'
// }) => {
//   const methodInfo = getMethodMetadata(method.type);
//   const themeClasses = getThemeClasses(theme);
  
//   // Theme-based CSS classes
//   const cardClass = theme === 'dark'
//     ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700 shadow-lg'
//     : 'bg-white border border-gray-200 shadow-md';

//   const inputClass = theme === 'dark'
//     ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
//     : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

//   const titleClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
//   const textClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
//   const labelClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
//   const errorClass = 'text-red-500 text-xs mt-1';

//   // EnhancedSelect handler
//   const handleEnhancedSelectChange = (fieldName) => (selectedValue) => {
//     const syntheticEvent = {
//       target: {
//         name: fieldName,
//         value: selectedValue
//       }
//     };
//     onChange(index, syntheticEvent);
//   };

//   const renderMethodSpecificFields = () => {
//     switch(method.type) {
//       case 'mpesa_paybill':
//         return (
//           <div className="space-y-4">
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Paybill Number <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="shortCode"
//                 value={method.shortCode || ''}
//                 onChange={(e) => onChange(index, e)}
//                 className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                 placeholder="123456"
//               />
//               {validationErrors[`${index}-shortCode`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-shortCode`]}</p>
//               )}
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Consumer Key <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={(showSecrets?.[`${index}-consumerKey`] ?? false) ? "text" : "password"}
//                   name="consumerKey"
//                   value={method.consumerKey || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
//                   placeholder="your_consumer_key_here"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onToggleSecret(index, 'consumerKey')}
//                   className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
//                     theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {(showSecrets?.[`${index}-consumerKey`] ?? false) ? <FiEyeOff /> : <FiEye />}
//                 </button>
//               </div>
//               {validationErrors[`${index}-consumerKey`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-consumerKey`]}</p>
//               )}
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Consumer Secret <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={(showSecrets?.[`${index}-consumerSecret`] ?? false) ? "text" : "password"}
//                   name="consumerSecret"
//                   value={method.consumerSecret || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
//                   placeholder="your_consumer_secret_here"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onToggleSecret(index, 'consumerSecret')}
//                   className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
//                     theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {(showSecrets?.[`${index}-consumerSecret`] ?? false) ? <FiEyeOff /> : <FiEye />}
//                 </button>
//               </div>
//               {validationErrors[`${index}-consumerSecret`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-consumerSecret`]}</p>
//               )}
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Pass Key <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={(showSecrets?.[`${index}-passKey`] ?? false) ? "text" : "password"}
//                   name="passKey"
//                   value={method.passKey || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
//                   placeholder="bfb279f9aa9bdbcf..."
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onToggleSecret(index, 'passKey')}
//                   className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
//                     theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {(showSecrets?.[`${index}-passKey`] ?? false) ? <FiEyeOff /> : <FiEye />}
//                 </button>
//               </div>
//               {validationErrors[`${index}-passKey`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-passKey`]}</p>
//               )}
//             </div>
//           </div>
//         );

//       case 'mpesa_till':
//         return (
//           <div className="space-y-4">
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Till Number <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 name="tillNumber"
//                 value={method.tillNumber || method.shortCode || ''}
//                 onChange={(e) => onChange(index, e)}
//                 className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                 placeholder="1234567"
//               />
//               {validationErrors[`${index}-tillNumber`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-tillNumber`]}</p>
//               )}
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Consumer Key <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={(showSecrets?.[`${index}-consumerKey`] ?? false) ? "text" : "password"}
//                   name="consumerKey"
//                   value={method.consumerKey || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
//                   placeholder="your_consumer_key_here"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onToggleSecret(index, 'consumerKey')}
//                   className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
//                     theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {(showSecrets?.[`${index}-consumerKey`] ?? false) ? <FiEyeOff /> : <FiEye />}
//                 </button>
//               </div>
//               {validationErrors[`${index}-consumerKey`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-consumerKey`]}</p>
//               )}
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Consumer Secret <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={(showSecrets?.[`${index}-consumerSecret`] ?? false) ? "text" : "password"}
//                   name="consumerSecret"
//                   value={method.consumerSecret || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
//                   placeholder="your_consumer_secret_here"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onToggleSecret(index, 'consumerSecret')}
//                   className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
//                     theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {(showSecrets?.[`${index}-consumerSecret`] ?? false) ? <FiEyeOff /> : <FiEye />}
//                 </button>
//               </div>
//               {validationErrors[`${index}-consumerSecret`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-consumerSecret`]}</p>
//               )}
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Pass Key <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={(showSecrets?.[`${index}-passKey`] ?? false) ? "text" : "password"}
//                   name="passKey"
//                   value={method.passKey || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
//                   placeholder="bfb279f9aa9bdbcf..."
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onToggleSecret(index, 'passKey')}
//                   className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
//                     theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {(showSecrets?.[`${index}-passKey`] ?? false) ? <FiEyeOff /> : <FiEye />}
//                 </button>
//               </div>
//               {validationErrors[`${index}-passKey`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-passKey`]}</p>
//               )}
//             </div>
//           </div>
//         );

//       case 'paypal':
//         return (
//           <div className="space-y-4">
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Client ID <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={(showSecrets?.[`${index}-clientId`] ?? false) ? "text" : "password"}
//                   name="clientId"
//                   value={method.clientId || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
//                   placeholder="AeA9Q3hL9L1dL8QJ6..."
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onToggleSecret(index, 'clientId')}
//                   className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
//                     theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {(showSecrets?.[`${index}-clientId`] ?? false) ? <FiEyeOff /> : <FiEye />}
//                 </button>
//               </div>
//               {validationErrors[`${index}-clientId`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-clientId`]}</p>
//               )}
//             </div>
            
//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Secret <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <input
//                   type={(showSecrets?.[`${index}-secret`] ?? false) ? "text" : "password"}
//                   name="secret"
//                   value={method.secret || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
//                   placeholder="EC-9QJ8QJ7QJ6QJ5..."
//                 />
//                 <button
//                   type="button"
//                   onClick={() => onToggleSecret(index, 'secret')}
//                   className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
//                     theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                 >
//                   {(showSecrets?.[`${index}-secret`] ?? false) ? <FiEyeOff /> : <FiEye />}
//                 </button>
//               </div>
//               {validationErrors[`${index}-secret`] && (
//                 <p className={errorClass}>{validationErrors[`${index}-secret`]}</p>
//               )}
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Merchant ID
//               </label>
//               <input
//                 type="text"
//                 name="merchantId"
//                 value={method.merchantId || ''}
//                 onChange={(e) => onChange(index, e)}
//                 className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                 placeholder="MERCHANT123456"
//               />
//             </div>
//           </div>
//         );

//       case 'bank_transfer':
//         return (
//           <div className="space-y-4">
//             <BankSelector
//               value={method.bankName || ''}
//               onChange={(e) => onChange(index, e)}
//               index={index}
//               theme={theme}
//             />
//             {validationErrors[`${index}-bankName`] && (
//               <p className={errorClass}>{validationErrors[`${index}-bankName`]}</p>
//             )}
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                   Account Number <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="accountNumber"
//                   value={method.accountNumber || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                   placeholder="1234567890"
//                 />
//                 {validationErrors[`${index}-accountNumber`] && (
//                   <p className={errorClass}>{validationErrors[`${index}-accountNumber`]}</p>
//                 )}
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                   Account Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="accountName"
//                   value={method.accountName || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                   placeholder="John Doe"
//                 />
//                 {validationErrors[`${index}-accountName`] && (
//                   <p className={errorClass}>{validationErrors[`${index}-accountName`]}</p>
//                 )}
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                   Branch Code
//                 </label>
//                 <input
//                   type="text"
//                   name="branchCode"
//                   value={method.branchCode || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                   placeholder="123"
//                 />
//                 {validationErrors[`${index}-branchCode`] && (
//                   <p className={errorClass}>{validationErrors[`${index}-branchCode`]}</p>
//                 )}
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                   SWIFT Code
//                 </label>
//                 <input
//                   type="text"
//                   name="swiftCode"
//                   value={method.swiftCode || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                   placeholder="ABCDKENA"
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                   IBAN
//                 </label>
//                 <input
//                   type="text"
//                   name="iban"
//                   value={method.iban || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                   placeholder="KE123456789012345678901234"
//                 />
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                   Routing Number
//                 </label>
//                 <input
//                   type="text"
//                   name="routingNumber"
//                   value={method.routingNumber || ''}
//                   onChange={(e) => onChange(index, e)}
//                   className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                   placeholder="021000021"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Bank Address
//               </label>
//               <textarea
//                 name="bankAddress"
//                 value={method.bankAddress || ''}
//                 onChange={(e) => onChange(index, e)}
//                 rows={3}
//                 className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                 placeholder="Bank Street, Nairobi, Kenya"
//               />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                   Account Type
//                 </label>
//                 <EnhancedSelect
//                   value={method.accountType || 'checking'}
//                   onChange={handleEnhancedSelectChange('accountType')}
//                   options={[
//                     { value: 'checking', label: 'Checking Account' },
//                     { value: 'savings', label: 'Savings Account' },
//                     { value: 'business', label: 'Business Account' },
//                     { value: 'corporate', label: 'Corporate Account' }
//                   ]}
//                   placeholder="Select account type"
//                   className="w-full"
//                   theme={theme}
//                 />
//               </div>

//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                   Currency
//                 </label>
//                 <EnhancedSelect
//                   value={method.currency || 'KES'}
//                   onChange={handleEnhancedSelectChange('currency')}
//                   options={[
//                     { value: 'KES', label: 'Kenyan Shilling (KES)' },
//                     { value: 'USD', label: 'US Dollar (USD)' },
//                     { value: 'EUR', label: 'Euro (EUR)' },
//                     { value: 'GBP', label: 'British Pound (GBP)' }
//                   ]}
//                   placeholder="Select currency"
//                   className="w-full"
//                   theme={theme}
//                 />
//               </div>
//             </div>

//             <div>
//               <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
//                 Bank Code
//               </label>
//               <input
//                 type="text"
//                 name="bankCode"
//                 value={method.bankCode || ''}
//                 onChange={(e) => onChange(index, e)}
//                 className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
//                 placeholder="Bank institution code"
//               />
//             </div>
//           </div>
//         );

//       default:
//         return (
//           <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
//             <FiInfo className="h-12 w-12 mx-auto mb-3 opacity-50" />
//             <p>No specific configuration required for this payment method.</p>
//             <p className="text-sm mt-1">Basic settings are available in Advanced Settings.</p>
//           </div>
//         );
//     }
//   };

//   const renderSecurityRecommendations = () => {
//     const baseRecommendations = [
//       { level: "high", text: "Rotate API keys every 90 days" },
//       { level: "critical", text: "Never commit secrets to version control" },
//       { level: "medium", text: "Restrict IP access to payment endpoints" },
//       { level: "medium", text: "Enable two-factor authentication where available" }
//     ];

//     const methodSpecificRecommendations = {
//       mpesa_paybill: [
//         { level: "high", text: "Keep passkey secure and encrypted" },
//         { level: "medium", text: "Monitor transaction logs regularly" },
//         { level: "medium", text: "Use different credentials for sandbox and production" }
//       ],
//       mpesa_till: [
//         { level: "high", text: "Keep passkey secure and encrypted" },
//         { level: "medium", text: "Monitor transaction logs regularly" },
//         { level: "medium", text: "Use different credentials for sandbox and production" }
//       ],
//       paypal: [
//         { level: "high", text: "Enable two-factor authentication on PayPal account" },
//         { level: "medium", text: "Use strong, unique passwords" },
//         { level: "medium", text: "Regularly review API access logs" }
//       ],
//       bank_transfer: [
//         { level: "high", text: "Keep bank account details secure and encrypted" },
//         { level: "medium", text: "Regularly monitor bank transactions" },
//         { level: "medium", text: "Use secure channels for sharing bank details" },
//         { level: "medium", text: "Implement dual authorization for large transfers" }
//       ]
//     };

//     const allRecommendations = [
//       ...baseRecommendations,
//       ...(methodSpecificRecommendations[method.type] || [])
//     ];

//     return (
//       <div className="space-y-3">
//         {allRecommendations.map((rec, idx) => (
//           <div key={idx} className="flex items-start">
//             <div className="flex-shrink-0 mt-0.5">
//               <SecurityBadge level={rec.level} theme={theme} />
//             </div>
//             <span className={`ml-3 text-sm ${textClass}`}>{rec.text}</span>
//           </div>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-6">
//       {/* Method header */}
//       <div className={`p-6 rounded-xl bg-gradient-to-r ${getMethodGradient(method.type)} text-white shadow-lg transition-all duration-300`}>
//         <div className="flex flex-col sm:flex-row sm:items-start gap-4">
//           <div className="flex-shrink-0 p-3 bg-white bg-opacity-20 rounded-xl">
//             {methodInfo.icon}
//           </div>
//           <div className="flex-1">
//             <h3 className="text-xl font-semibold">{methodInfo.label}</h3>
//             <p className="mt-1 text-blue-100 opacity-90">{methodInfo.description}</p>
//             <div className="mt-3 flex flex-wrap gap-2">
//               <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
//                 Currencies: {methodInfo.supportedCurrencies?.join(', ') || 'Multiple'}
//               </span>
//               <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
//                 Fees: {methodInfo.feeStructure || 'Varies'}
//               </span>
//               {methodInfo.documentationLink && (
//                 <a 
//                   href={methodInfo.documentationLink} 
//                   target="_blank" 
//                   rel="noopener noreferrer"
//                   className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-colors"
//                 >
//                   View Documentation
//                 </a>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Left Column - Credentials & Advanced Settings */}
//         <div className="space-y-6">
//           {/* Credentials Section */}
//           <div className={`p-6 rounded-xl ${cardClass} transition-colors duration-300`}>
//             <h3 className={`text-lg font-medium mb-4 flex items-center ${titleClass}`}>
//               <FiLock className={`mr-2 ${theme === 'dark' ? 'text-indigo-400' : 'text-blue-500'}`} />
//               Credentials
//             </h3>
//             {renderMethodSpecificFields()}
//           </div>

//           {/* Advanced Settings Component */}
//           <AdvancedSettings
//             method={method}
//             index={index}
//             showAdvanced={showAdvanced}
//             toggleAdvancedSettings={onToggleAdvanced}
//             handleChange={onChange}
//             showSecrets={showSecrets}
//             toggleSecretVisibility={onToggleSecret}
//             copyToClipboard={onCopyToClipboard}
//             theme={theme}
//           />
//         </div>
        
//         {/* Right Column - Webhook, M-Pesa Config & Security */}
//         <div className="space-y-6">
//           {/* Webhook Configuration Component */}
//           <WebhookConfiguration
//             callbackUrl={method.callbackURL}
//             onChange={(e) => onChange(index, e)}
//             index={index}
//             generateCallbackUrl={onGenerateCallback}
//             testConnection={
//               <TestConnectionButton 
//                 methodType={method.type} 
//                 gatewayId={method.id}
//                 callbackUrl={method.callbackURL}
//                 theme={theme}
//               />
//             }
//             copyToClipboard={onCopyToClipboard}
//             theme={theme}
//           />
          
//           {/* M-Pesa Simple Config Component */}
//           {(method.type === 'mpesa_paybill' || method.type === 'mpesa_till') && (
//             <SimpleMpesaConfig method={method} theme={theme} />
//           )}

//           {/* Security Recommendations */}
//           <div className={`p-6 rounded-xl ${cardClass} transition-colors duration-300`}>
//             <h3 className={`text-lg font-medium mb-4 flex items-center ${titleClass}`}>
//               <FiShield className={`mr-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
//               Security Recommendations
//             </h3>
//             {renderSecurityRecommendations()}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MethodFields;





// src/components/PaymentConfiguration/MethodFields.jsx
import React from 'react';
import {
  FiLock,
  FiShield,
  FiEye,
  FiEyeOff,
  FiInfo
} from 'react-icons/fi';
import AdvancedSettings from './AdvancedSettings';
import BankSelector from './BankSelector';
import WebhookConfiguration from './WebhookConfiguration';
import TestConnectionButton from './TestConnectionButton';
import SecurityBadge from './SecurityBadge';
import SimpleMpesaConfig from './SimpleMpesaConfig';
import { getMethodMetadata, getMethodGradient } from './Utils/paymentUtils';
import { EnhancedSelect, getThemeClasses } from '../ServiceManagement/Shared/components'

const MethodFields = ({
  method,
  index,
  validationErrors,
  showSecrets,
  showAdvanced,
  onChange,
  onToggleSecret,
  onToggleAdvanced,
  onGenerateCallback,
  onCopyToClipboard,
  theme = 'light'
}) => {
  const methodInfo = getMethodMetadata(method.type);
  const themeClasses = getThemeClasses(theme);
  
  // Theme-based CSS classes
  const cardClass = theme === 'dark'
    ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700 shadow-lg'
    : 'bg-white border border-gray-200 shadow-md';

  const inputClass = theme === 'dark'
    ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

  const titleClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const labelClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const errorClass = 'text-red-500 text-xs mt-1';

  // EnhancedSelect handler
  const handleEnhancedSelectChange = (fieldName) => (selectedValue) => {
    const syntheticEvent = {
      target: {
        name: fieldName,
        value: selectedValue
      }
    };
    onChange(index, syntheticEvent);
  };

  // FIXED: Safe toggle secret function with validation
  const handleToggleSecret = (fieldName) => {
    return (event) => {
      event?.preventDefault();
      event?.stopPropagation();
      
      // Validate parameters before calling
      if (!fieldName || index === undefined) {
        console.warn("Invalid parameters for toggleSecretVisibility:", { fieldName, index });
        return;
      }
      
      if (typeof onToggleSecret === 'function') {
        onToggleSecret(fieldName);
      }
    };
  };

  const renderMethodSpecificFields = () => {
    switch(method.type) {
      case 'mpesa_paybill':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Paybill Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="shortCode"
                value={method.shortCode || ''}
                onChange={(e) => onChange(index, e)}
                className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
                placeholder="123456"
              />
              {validationErrors[`${index}-shortCode`] && (
                <p className={errorClass}>{validationErrors[`${index}-shortCode`]}</p>
              )}
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Consumer Key <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={(showSecrets?.[`${index}-consumerKey`] ?? false) ? "text" : "password"}
                  name="consumerKey"
                  value={method.consumerKey || ''}
                  onChange={(e) => onChange(index, e)}
                  className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
                  placeholder="your_consumer_key_here"
                />
                <button
                  type="button"
                  onClick={handleToggleSecret('consumerKey')}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
                    theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {(showSecrets?.[`${index}-consumerKey`] ?? false) ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {validationErrors[`${index}-consumerKey`] && (
                <p className={errorClass}>{validationErrors[`${index}-consumerKey`]}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Consumer Secret <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={(showSecrets?.[`${index}-consumerSecret`] ?? false) ? "text" : "password"}
                  name="consumerSecret"
                  value={method.consumerSecret || ''}
                  onChange={(e) => onChange(index, e)}
                  className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
                  placeholder="your_consumer_secret_here"
                />
                <button
                  type="button"
                  onClick={handleToggleSecret('consumerSecret')}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
                    theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {(showSecrets?.[`${index}-consumerSecret`] ?? false) ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {validationErrors[`${index}-consumerSecret`] && (
                <p className={errorClass}>{validationErrors[`${index}-consumerSecret`]}</p>
              )}
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Pass Key <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={(showSecrets?.[`${index}-passKey`] ?? false) ? "text" : "password"}
                  name="passKey"
                  value={method.passKey || ''}
                  onChange={(e) => onChange(index, e)}
                  className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
                  placeholder="bfb279f9aa9bdbcf..."
                />
                <button
                  type="button"
                  onClick={handleToggleSecret('passKey')}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
                    theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {(showSecrets?.[`${index}-passKey`] ?? false) ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {validationErrors[`${index}-passKey`] && (
                <p className={errorClass}>{validationErrors[`${index}-passKey`]}</p>
              )}
            </div>
          </div>
        );

      case 'mpesa_till':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Till Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tillNumber"
                value={method.tillNumber || method.shortCode || ''}
                onChange={(e) => onChange(index, e)}
                className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
                placeholder="1234567"
              />
              {validationErrors[`${index}-tillNumber`] && (
                <p className={errorClass}>{validationErrors[`${index}-tillNumber`]}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Consumer Key <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={(showSecrets?.[`${index}-consumerKey`] ?? false) ? "text" : "password"}
                  name="consumerKey"
                  value={method.consumerKey || ''}
                  onChange={(e) => onChange(index, e)}
                  className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
                  placeholder="your_consumer_key_here"
                />
                <button
                  type="button"
                  onClick={handleToggleSecret('consumerKey')}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
                    theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {(showSecrets?.[`${index}-consumerKey`] ?? false) ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {validationErrors[`${index}-consumerKey`] && (
                <p className={errorClass}>{validationErrors[`${index}-consumerKey`]}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Consumer Secret <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={(showSecrets?.[`${index}-consumerSecret`] ?? false) ? "text" : "password"}
                  name="consumerSecret"
                  value={method.consumerSecret || ''}
                  onChange={(e) => onChange(index, e)}
                  className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
                  placeholder="your_consumer_secret_here"
                />
                <button
                  type="button"
                  onClick={handleToggleSecret('consumerSecret')}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
                    theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {(showSecrets?.[`${index}-consumerSecret`] ?? false) ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {validationErrors[`${index}-consumerSecret`] && (
                <p className={errorClass}>{validationErrors[`${index}-consumerSecret`]}</p>
              )}
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Pass Key <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={(showSecrets?.[`${index}-passKey`] ?? false) ? "text" : "password"}
                  name="passKey"
                  value={method.passKey || ''}
                  onChange={(e) => onChange(index, e)}
                  className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
                  placeholder="bfb279f9aa9bdbcf..."
                />
                <button
                  type="button"
                  onClick={handleToggleSecret('passKey')}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
                    theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {(showSecrets?.[`${index}-passKey`] ?? false) ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {validationErrors[`${index}-passKey`] && (
                <p className={errorClass}>{validationErrors[`${index}-passKey`]}</p>
              )}
            </div>
          </div>
        );

      case 'paypal':
        return (
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Client ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={(showSecrets?.[`${index}-clientId`] ?? false) ? "text" : "password"}
                  name="clientId"
                  value={method.clientId || ''}
                  onChange={(e) => onChange(index, e)}
                  className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
                  placeholder="AeA9Q3hL9L1dL8QJ6..."
                />
                <button
                  type="button"
                  onClick={handleToggleSecret('clientId')}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
                    theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {(showSecrets?.[`${index}-clientId`] ?? false) ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {validationErrors[`${index}-clientId`] && (
                <p className={errorClass}>{validationErrors[`${index}-clientId`]}</p>
              )}
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Secret <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={(showSecrets?.[`${index}-secret`] ?? false) ? "text" : "password"}
                  name="secret"
                  value={method.secret || ''}
                  onChange={(e) => onChange(index, e)}
                  className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors pr-10 ${inputClass}`}
                  placeholder="EC-9QJ8QJ7QJ6QJ5..."
                />
                <button
                  type="button"
                  onClick={handleToggleSecret('secret')}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
                    theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {(showSecrets?.[`${index}-secret`] ?? false) ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {validationErrors[`${index}-secret`] && (
                <p className={errorClass}>{validationErrors[`${index}-secret`]}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Merchant ID
              </label>
              <input
                type="text"
                name="merchantId"
                value={method.merchantId || ''}
                onChange={(e) => onChange(index, e)}
                className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
                placeholder="MERCHANT123456"
              />
            </div>
          </div>
        );

      case 'bank_transfer':
        return (
          <div className="space-y-4">
            <BankSelector
              value={method.bankName || ''}
              onChange={(e) => onChange(index, e)}
              index={index}
              theme={theme}
            />
            {validationErrors[`${index}-bankName`] && (
              <p className={errorClass}>{validationErrors[`${index}-bankName`]}</p>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={method.accountNumber || ''}
                  onChange={(e) => onChange(index, e)}
                  className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
                  placeholder="1234567890"
                />
                {validationErrors[`${index}-accountNumber`] && (
                  <p className={errorClass}>{validationErrors[`${index}-accountNumber`]}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                  Account Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="accountName"
                  value={method.accountName || ''}
                  onChange={(e) => onChange(index, e)}
                  className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
                  placeholder="John Doe"
                />
                {validationErrors[`${index}-accountName`] && (
                  <p className={errorClass}>{validationErrors[`${index}-accountName`]}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                  Branch Code
                </label>
                <input
                  type="text"
                  name="branchCode"
                  value={method.branchCode || ''}
                  onChange={(e) => onChange(index, e)}
                  className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
                  placeholder="123"
                />
                {validationErrors[`${index}-branchCode`] && (
                  <p className={errorClass}>{validationErrors[`${index}-branchCode`]}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                  SWIFT Code
                </label>
                <input
                  type="text"
                  name="swiftCode"
                  value={method.swiftCode || ''}
                  onChange={(e) => onChange(index, e)}
                  className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
                  placeholder="ABCDKENA"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                  IBAN
                </label>
                <input
                  type="text"
                  name="iban"
                  value={method.iban || ''}
                  onChange={(e) => onChange(index, e)}
                  className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
                  placeholder="KE123456789012345678901234"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                  Routing Number
                </label>
                <input
                  type="text"
                  name="routingNumber"
                  value={method.routingNumber || ''}
                  onChange={(e) => onChange(index, e)}
                  className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
                  placeholder="021000021"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Bank Address
              </label>
              <textarea
                name="bankAddress"
                value={method.bankAddress || ''}
                onChange={(e) => onChange(index, e)}
                rows={3}
                className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
                placeholder="Bank Street, Nairobi, Kenya"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                  Account Type
                </label>
                <EnhancedSelect
                  value={method.accountType || 'checking'}
                  onChange={handleEnhancedSelectChange('accountType')}
                  options={[
                    { value: 'checking', label: 'Checking Account' },
                    { value: 'savings', label: 'Savings Account' },
                    { value: 'business', label: 'Business Account' },
                    { value: 'corporate', label: 'Corporate Account' }
                  ]}
                  placeholder="Select account type"
                  className="w-full"
                  theme={theme}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                  Currency
                </label>
                <EnhancedSelect
                  value={method.currency || 'KES'}
                  onChange={handleEnhancedSelectChange('currency')}
                  options={[
                    { value: 'KES', label: 'Kenyan Shilling (KES)' },
                    { value: 'USD', label: 'US Dollar (USD)' },
                    { value: 'EUR', label: 'Euro (EUR)' },
                    { value: 'GBP', label: 'British Pound (GBP)' }
                  ]}
                  placeholder="Select currency"
                  className="w-full"
                  theme={theme}
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                Bank Code
              </label>
              <input
                type="text"
                name="bankCode"
                value={method.bankCode || ''}
                onChange={(e) => onChange(index, e)}
                className={`block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${inputClass}`}
                placeholder="Bank institution code"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <FiInfo className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No specific configuration required for this payment method.</p>
            <p className="text-sm mt-1">Basic settings are available in Advanced Settings.</p>
          </div>
        );
    }
  };

  const renderSecurityRecommendations = () => {
    const baseRecommendations = [
      { level: "high", text: "Rotate API keys every 90 days" },
      { level: "critical", text: "Never commit secrets to version control" },
      { level: "medium", text: "Restrict IP access to payment endpoints" },
      { level: "medium", text: "Enable two-factor authentication where available" }
    ];

    const methodSpecificRecommendations = {
      mpesa_paybill: [
        { level: "high", text: "Keep passkey secure and encrypted" },
        { level: "medium", text: "Monitor transaction logs regularly" },
        { level: "medium", text: "Use different credentials for sandbox and production" }
      ],
      mpesa_till: [
        { level: "high", text: "Keep passkey secure and encrypted" },
        { level: "medium", text: "Monitor transaction logs regularly" },
        { level: "medium", text: "Use different credentials for sandbox and production" }
      ],
      paypal: [
        { level: "high", text: "Enable two-factor authentication on PayPal account" },
        { level: "medium", text: "Use strong, unique passwords" },
        { level: "medium", text: "Regularly review API access logs" }
      ],
      bank_transfer: [
        { level: "high", text: "Keep bank account details secure and encrypted" },
        { level: "medium", text: "Regularly monitor bank transactions" },
        { level: "medium", text: "Use secure channels for sharing bank details" },
        { level: "medium", text: "Implement dual authorization for large transfers" }
      ]
    };

    const allRecommendations = [
      ...baseRecommendations,
      ...(methodSpecificRecommendations[method.type] || [])
    ];

    return (
      <div className="space-y-3">
        {allRecommendations.map((rec, idx) => (
          <div key={idx} className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <SecurityBadge level={rec.level} theme={theme} />
            </div>
            <span className={`ml-3 text-sm ${textClass}`}>{rec.text}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Method header */}
      <div className={`p-6 rounded-xl bg-gradient-to-r ${getMethodGradient(method.type)} text-white shadow-lg transition-all duration-300`}>
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-shrink-0 p-3 bg-white bg-opacity-20 rounded-xl">
            {methodInfo.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold">{methodInfo.label}</h3>
            <p className="mt-1 text-blue-100 opacity-90">{methodInfo.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
                Currencies: {methodInfo.supportedCurrencies?.join(', ') || 'Multiple'}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
                Fees: {methodInfo.feeStructure || 'Varies'}
              </span>
              {methodInfo.documentationLink && (
                <a 
                  href={methodInfo.documentationLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-colors"
                >
                  View Documentation
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Credentials & Advanced Settings */}
        <div className="space-y-6">
          {/* Credentials Section */}
          <div className={`p-6 rounded-xl ${cardClass} transition-colors duration-300`}>
            <h3 className={`text-lg font-medium mb-4 flex items-center ${titleClass}`}>
              <FiLock className={`mr-2 ${theme === 'dark' ? 'text-indigo-400' : 'text-blue-500'}`} />
              Credentials
            </h3>
            {renderMethodSpecificFields()}
          </div>

          {/* Advanced Settings Component */}
          <AdvancedSettings
            method={method}
            index={index}
            showAdvanced={showAdvanced?.[index] || false}
            toggleAdvancedSettings={onToggleAdvanced}
            handleChange={onChange}
            showSecrets={showSecrets?.[`${index}-webhookSecret`] || false}
            toggleSecretVisibility={handleToggleSecret('webhookSecret')}
            copyToClipboard={onCopyToClipboard}
            theme={theme}
          />
        </div>
        
        {/* Right Column - Webhook, M-Pesa Config & Security */}
        <div className="space-y-6">
          {/* Webhook Configuration Component */}
          <WebhookConfiguration
            callbackUrl={method.callbackURL}
            onChange={(e) => onChange(index, e)}
            index={index}
            generateCallbackUrl={onGenerateCallback}
            testConnection={
              <TestConnectionButton 
                methodType={method.type} 
                gatewayId={method.id}
                callbackUrl={method.callbackURL}
                theme={theme}
              />
            }
            copyToClipboard={onCopyToClipboard}
            theme={theme}
          />
          
          {/* M-Pesa Simple Config Component */}
          {(method.type === 'mpesa_paybill' || method.type === 'mpesa_till') && (
            <SimpleMpesaConfig method={method} theme={theme} />
          )}

          {/* Security Recommendations */}
          <div className={`p-6 rounded-xl ${cardClass} transition-colors duration-300`}>
            <h3 className={`text-lg font-medium mb-4 flex items-center ${titleClass}`}>
              <FiShield className={`mr-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
              Security Recommendations
            </h3>
            {renderSecurityRecommendations()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MethodFields;