


// import React, { useState, useEffect } from 'react';
// import {
//   FiSave, FiRefreshCw, FiCheckCircle, FiPlus, FiTrash2,
//   FiSmartphone, FiDollarSign, FiHome, FiEye, FiEyeOff, FiCode,
//   FiInfo, FiShield, FiSettings, FiClipboard, FiEdit2, FiCopy,
//   FiChevronRight, FiAlertCircle, FiZap, FiArrowLeft, FiCreditCard,
//   FiChevronDown, FiChevronUp
// } from 'react-icons/fi';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { Puff } from 'react-loading-icons';
// import AdvancedSettings from '../../components/PaymentConfiguration/AdvancedSettings';
// import BankSelector from '../../components/PaymentConfiguration/BankSelector';
// import WebhookConfiguration from '../../components/PaymentConfiguration/WebhookConfiguration';
// import PaymentMethodCard from '../../components/PaymentConfiguration/PaymentMethodCard';
// import TestConnectionButton from '../../components/PaymentConfiguration/TestConnectionButton';
// import SecurityBadge from '../../components/PaymentConfiguration/SecurityBadge';
// import ConfigurationHistory from '../../components/PaymentConfiguration/ConfigurationHistory';
// import PaymentConfigurationHeader from '../../components/PaymentConfiguration/PaymentConfigurationHeader';
// import PaymentMethodTabs from '../../components/PaymentConfiguration/PaymentMethodTabs';
// import AddMethodModal from '../../components/PaymentConfiguration/AddMethodModal';
// import { PAYMENT_METHODS, KENYAN_BANKS } from '../../components/PaymentConfiguration/Utils/paymentConstants';
// import { mockSavedConfig, mockHistory, initialConfig } from '../../components/PaymentConfiguration/Utils/mockPaymentData';
// import { getMethodIcon, getMethodLabel, getMethodColor, getMethodGradient, getMethodMetadata } from '../../components/PaymentConfiguration/Utils/paymentUtils';

// const PaymentConfiguration = () => {
//   // State management
//   const [config, setConfig] = useState(initialConfig);
//   const [savedConfig, setSavedConfig] = useState(null);
//   const [loading, setLoading] = useState(true); // Start with loading true
//   const [error, setError] = useState(null);
//   const [showEditForm, setShowEditForm] = useState(false);
//   const [activeTab, setActiveTab] = useState(0);
//   const [showSecrets, setShowSecrets] = useState({});
//   const [showAdvanced, setShowAdvanced] = useState({});
//   const [history, setHistory] = useState([]);
//   const [methodToAdd, setMethodToAdd] = useState(null);
//   const [showAddModal, setShowAddModal] = useState(false);

//   // Load initial data
//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         // Simulate API call
//         await new Promise(resolve => setTimeout(resolve, 1000));
//         setSavedConfig(mockSavedConfig);
//         setConfig({ ...mockSavedConfig });
//         setHistory(mockHistory);
//         setShowEditForm(false);
//         setError(null);
//       } catch (err) {
//         setError('Failed to load configuration');
//         showToast('Failed to load payment configuration', 'error');
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, []);

//   // Helper functions
//   const showToast = (message, type = 'success') => {
//     toast[type](message, {
//       position: "top-right",
//       autoClose: type === 'error' ? 5000 : 3000,
//       hideProgressBar: false,
//       closeOnClick: true,
//       pauseOnHover: true,
//       draggable: true,
//       progress: undefined,
//       theme: "colored",
//     });
//   };

//   const handleChange = (index, e) => {
//     const { name, value, type, checked } = e.target;
//     setConfig(prev => ({
//       ...prev,
//       paymentMethods: prev.paymentMethods.map((method, i) =>
//         i === index ? { ...method, [name]: type === 'checkbox' ? checked : value } : method
//       ),
//       lastUpdated: new Date().toISOString()
//     }));
//   };

//   const toggleSecretVisibility = (index) => {
//     setShowSecrets(prev => ({ ...prev, [index]: !prev[index] }));
//   };

//   const toggleAdvancedSettings = (index) => {
//     setShowAdvanced(prev => ({ ...prev, [index]: !prev[index] }));
//   };

//   const handleMethodTypeChange = (index, value) => {
//     setConfig(prev => ({
//       ...prev,
//       paymentMethods: prev.paymentMethods.map((method, i) =>
//         i === index ? {
//           type: value,
//           isActive: method.isActive,
//           sandboxMode: false,
//           autoSettle: true,
//           ...getDefaultValues(value)
//         } : method
//       ),
//       lastUpdated: new Date().toISOString()
//     }));
//   };

//   const getDefaultValues = (type) => {
//     switch(type) {
//       case 'mpesa_paybill':
//         return {
//           apiKey: '',
//           secretKey: '',
//           shortCode: '',
//           passKey: '',
//           callbackURL: '',
//           webhookSecret: '',
//           transactionLimit: '500000'
//         };
//       case 'mpesa_till':
//         return {
//           tillNumber: '',
//           storeNumber: '',
//           passKey: '',
//           callbackURL: '',
//           webhookSecret: '',
//           transactionLimit: '200000'
//         };
//       case 'paypal':
//         return {
//           clientId: '',
//           secret: '',
//           merchantId: '',
//           callbackURL: '',
//           webhookSecret: '',
//           transactionLimit: '10000'
//         };
//       case 'bank':
//         return {
//           bankName: '',
//           accountNumber: '',
//           accountName: '',
//           branchCode: '',
//           swiftCode: '',
//           callbackURL: '',
//           transactionLimit: '1000000'
//         };
//       default:
//         return {};
//     }
//   };

//   const generateCallbackUrl = (index) => {
//     const method = config.paymentMethods[index];
//     const baseUrl = window.location.origin;
//     const webhookId = `wh_${Math.random().toString(36).substring(2, 15)}`;
//     let path = '/api/v1/payments/callback';
    
//     if (method.type === 'mpesa_paybill' || method.type === 'mpesa_till') {
//       path = `/api/v1/payments/mpesa/callback/${webhookId}`;
//     } else if (method.type === 'paypal') {
//       path = `/api/v1/payments/paypal/callback/${webhookId}`;
//     } else if (method.type === 'bank') {
//       path = `/api/v1/payments/bank/callback/${webhookId}`;
//     }
    
//     const callbackUrl = `${baseUrl}${path}`;
//     const webhookSecret = `whsec_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
//     setConfig(prev => ({
//       ...prev,
//       paymentMethods: prev.paymentMethods.map((m, i) =>
//         i === index ? { ...m, callbackURL: callbackUrl, webhookSecret } : m
//       ),
//       lastUpdated: new Date().toISOString()
//     }));
    
//     showToast('Callback URL and webhook secret generated!');
//   };

//   const copyToClipboard = (text) => {
//     if (!text) return;
//     navigator.clipboard.writeText(text);
//     showToast('Copied to clipboard!', 'info');
//   };

//   const openAddMethodModal = () => {
//     const available = Object.values(PAYMENT_METHODS).filter(
//       method => !config.paymentMethods.some(m => m.type === method.value)
//     );
    
//     if (available.length === 0) {
//       showToast('All payment methods already added', 'info');
//       return;
//     }
    
//     setShowAddModal(true);
//   };

//   const confirmAddPaymentMethod = () => {
//     if (!methodToAdd) return;
    
//     setConfig(prev => ({
//       ...prev,
//       paymentMethods: [
//         ...prev.paymentMethods,
//         {
//           type: methodToAdd,
//           isActive: true,
//           sandboxMode: false,
//           autoSettle: true,
//           ...getDefaultValues(methodToAdd)
//         }
//       ],
//       lastUpdated: new Date().toISOString()
//     }));
    
//     setActiveTab(config.paymentMethods.length);
//     setMethodToAdd(null);
//     setShowAddModal(false);
//     showToast(`${getMethodLabel(methodToAdd)} added successfully`);
//   };

//   const removePaymentMethod = (index) => {
//     if (config.paymentMethods.length <= 1) {
//       showToast('You must have at least one payment method', 'error');
//       return;
//     }
    
//     const methodName = getMethodLabel(config.paymentMethods[index].type);
//     setConfig(prev => ({
//       ...prev,
//       paymentMethods: prev.paymentMethods.filter((_, i) => i !== index),
//       lastUpdated: new Date().toISOString()
//     }));
    
//     if (activeTab >= index) {
//       setActiveTab(Math.max(0, activeTab - 1));
//     }
    
//     showToast(`Removed ${methodName} payment method`, 'warning');
//   };

//   const validateConfig = () => {
//     const errors = [];
//     config.paymentMethods.forEach((method, index) => {
//       if (!method.isActive) return;
      
//       switch(method.type) {
//         case 'mpesa_paybill':
//           if (!method.shortCode || !method.passKey) {
//             errors.push(`M-Pesa Paybill (${index + 1}) missing required fields`);
//           }
//           break;
//         case 'mpesa_till':
//           if (!method.tillNumber || !method.passKey) {
//             errors.push(`M-Pesa Till (${index + 1}) missing required fields`);
//           }
//           break;
//         case 'paypal':
//           if (!method.clientId || !method.secret) {
//             errors.push(`PayPal (${index + 1}) missing required fields`);
//           }
//           break;
//         case 'bank':
//           if (!method.bankName || !method.accountNumber) {
//             errors.push(`Bank Transfer (${index + 1}) missing required fields`);
//           }
//           break;
//       }
//     });
//     return errors;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     const errors = validateConfig();
//     if (errors.length > 0) {
//       setLoading(false);
//       errors.forEach(err => showToast(err, 'error'));
//       return;
//     }
    
//     setTimeout(() => {
//       try {
//         const newHistory = {
//           id: history.length + 1,
//           timestamp: new Date().toISOString(),
//           user: 'admin@example.com',
//           action: 'Updated payment configuration',
//           changes: ['Modified payment methods']
//         };
        
//         setSavedConfig(config);
//         setHistory([newHistory, ...history]);
//         showToast('Configuration saved successfully!');
//         setShowEditForm(false);
//       } catch (err) {
//         showToast('Failed to save configuration', 'error');
//       } finally {
//         setLoading(false);
//       }
//     }, 1500);
//   };

//   const handleReset = () => {
//     setConfig(savedConfig ? { ...savedConfig } : { ...mockSavedConfig });
//     showToast('Configuration reset to last saved state', 'info');
//   };

//   // Render method fields based on type
//   const renderMethodFields = (method, index) => {
//     const methodInfo = getMethodMetadata(method.type);
    
//     return (
//       <div className="space-y-6">
//         {/* Method header */}
//         <div className={`p-5 rounded-xl bg-gradient-to-r ${getMethodGradient(method.type)} text-white shadow-md`}>
//           <div className="flex items-start">
//             <div className="flex-shrink-0 p-2 bg-white bg-opacity-20 rounded-lg">
//               {methodInfo.icon}
//             </div>
//             <div className="ml-4">
//               <h3 className="text-xl font-semibold">{methodInfo.label}</h3>
//               <p className="mt-1 text-blue-100">{methodInfo.description}</p>
//               <div className="mt-3 flex flex-wrap gap-2">
//                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
//                   Currencies: {methodInfo.supportedCurrencies.join(', ')}
//                 </span>
//                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
//                   Fees: {methodInfo.feeStructure}
//                 </span>
//                 <a 
//                   href={methodInfo.documentationLink} 
//                   target="_blank" 
//                   rel="noopener noreferrer"
//                   className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white hover:bg-opacity-30"
//                 >
//                   View Documentation
//                 </a>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Method form */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <div className="space-y-6">
//             {/* Credentials */}
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//               <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
//                 <FiShield className="mr-2 text-blue-500" />
//                 Credentials
//               </h3>
              
//               {method.type === 'mpesa_paybill' && (
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       API Key <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative">
//                       <input
//                         type={showSecrets[index] ? "text" : "password"}
//                         name="apiKey"
//                         value={method.apiKey || ''}
//                         onChange={(e) => handleChange(index, e)}
//                         className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                         placeholder="sk_live_xxxxxxxx"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => toggleSecretVisibility(index)}
//                         className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
//                       >
//                         {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
//                       </button>
//                     </div>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Paybill Number <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       name="shortCode"
//                       value={method.shortCode || ''}
//                       onChange={(e) => handleChange(index, e)}
//                       className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                       placeholder="123456"
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Pass Key <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative">
//                       <input
//                         type={showSecrets[index] ? "text" : "password"}
//                         name="passKey"
//                         value={method.passKey || ''}
//                         onChange={(e) => handleChange(index, e)}
//                         className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                         placeholder="bfb279f9aa9bdbcf..."
//                       />
//                       <button
//                         type="button"
//                         onClick={() => toggleSecretVisibility(index)}
//                         className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
//                       >
//                         {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
              
//               {method.type === 'mpesa_till' && (
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Till Number <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       name="tillNumber"
//                       value={method.tillNumber || ''}
//                       onChange={(e) => handleChange(index, e)}
//                       className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                       placeholder="1234567"
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Pass Key <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative">
//                       <input
//                         type={showSecrets[index] ? "text" : "password"}
//                         name="passKey"
//                         value={method.passKey || ''}
//                         onChange={(e) => handleChange(index, e)}
//                         className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                         placeholder="bfb279f9aa9bdbcf..."
//                       />
//                       <button
//                         type="button"
//                         onClick={() => toggleSecretVisibility(index)}
//                         className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
//                       >
//                         {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
              
//               {method.type === 'paypal' && (
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Client ID <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       name="clientId"
//                       value={method.clientId || ''}
//                       onChange={(e) => handleChange(index, e)}
//                       className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                       placeholder="AeA9Q3hL9L1dL8QJ6..."
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Secret <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative">
//                       <input
//                         type={showSecrets[index] ? "text" : "password"}
//                         name="secret"
//                         value={method.secret || ''}
//                         onChange={(e) => handleChange(index, e)}
//                         className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                         placeholder="EC-9QJ8QJ7QJ6QJ5..."
//                       />
//                       <button
//                         type="button"
//                         onClick={() => toggleSecretVisibility(index)}
//                         className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
//                       >
//                         {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
              
//               {method.type === 'bank' && (
//                 <div className="space-y-4">
//                   <BankSelector
//                     value={method.bankName}
//                     onChange={(e) => handleChange(index, e)}
//                     index={index}
//                     banks={KENYAN_BANKS}
//                   />
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Account Number <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       name="accountNumber"
//                       value={method.accountNumber || ''}
//                       onChange={(e) => handleChange(index, e)}
//                       className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                       placeholder="1234567890"
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>

//             <AdvancedSettings
//               method={method}
//               index={index}
//               showAdvanced={showAdvanced[index]}
//               toggleAdvancedSettings={() => toggleAdvancedSettings(index)}
//               handleChange={handleChange}
//               showSecrets={showSecrets[index]}
//               toggleSecretVisibility={() => toggleSecretVisibility(index)}
//               copyToClipboard={copyToClipboard}
//             />
//           </div>
          
//           <div className="space-y-6">
//             <WebhookConfiguration
//               callbackUrl={method.callbackURL}
//               onChange={(e) => handleChange(index, e)}
//               index={index}
//               generateCallbackUrl={() => generateCallbackUrl(index)}
//               testConnection={
//                 <TestConnectionButton 
//                   methodType={method.type} 
//                   callbackUrl={method.callbackURL}
//                 />
//               }
//               copyToClipboard={copyToClipboard}
//             />
            
//             {/* Security recommendations */}
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//               <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
//                 <FiShield className="mr-2 text-red-500" />
//                 Security Recommendations
//               </h3>
              
//               <ul className="space-y-3 text-sm text-gray-700">
//                 <li className="flex items-start">
//                   <SecurityBadge level="high" />
//                   <span className="ml-2">Rotate API keys every 90 days</span>
//                 </li>
//                 <li className="flex items-start">
//                   <SecurityBadge level="critical" />
//                   <span className="ml-2">Never commit secrets to version control</span>
//                 </li>
//                 <li className="flex items-start">
//                   <SecurityBadge level="medium" />
//                   <span className="ml-2">Restrict IP access to payment endpoints</span>
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">
//         <PaymentConfigurationHeader 
//           savedConfig={savedConfig}
//           showEditForm={showEditForm}
//           onEdit={() => setShowEditForm(true)}
//           onBack={() => setShowEditForm(false)}
//         />

//         <div className="bg-white rounded-xl shadow-md overflow-hidden">
//           {loading ? (
//             <div className="text-center py-16">
//               <div className="inline-flex flex-col items-center justify-center space-y-4">
//                 <Puff stroke="#3B82F6" speed={1} />
//                 <div>
//                   <h3 className="text-lg font-medium text-gray-700">Loading Payment Configuration</h3>
//                   <p className="mt-1 text-sm text-gray-500">Securely fetching your payment settings...</p>
//                 </div>
//               </div>
//             </div>
//           ) : error ? (
//             <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
//               <div className="flex items-center">
//                 <FiAlertCircle className="h-5 w-5 text-red-500" />
//                 <div className="ml-3">
//                   <p className="text-sm text-red-700">{error}</p>
//                 </div>
//               </div>
//             </div>
//           ) : showEditForm ? (
//             <form onSubmit={handleSubmit}>
//               <PaymentMethodTabs
//                 methods={config.paymentMethods}
//                 activeTab={activeTab}
//                 onChangeTab={setActiveTab}
//                 onAddMethod={openAddMethodModal}
//               />

//               {config.paymentMethods.map((method, index) => (
//                 <div key={index} className={activeTab === index ? 'block' : 'hidden'}>
//                   <div className="bg-gray-50 rounded-xl p-6 mb-8 shadow-inner">
//                     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                       <div className="flex-1">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Payment Method Type <span className="text-red-500">*</span>
//                         </label>
//                         <select
//                           value={method.type}
//                           onChange={(e) => handleMethodTypeChange(index, e.target.value)}
//                           className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                         >
//                           {Object.values(PAYMENT_METHODS).map((option, i) => (
//                             <option key={i} value={option.value}>{option.label}</option>
//                           ))}
//                         </select>
//                       </div>
                      
//                       <div className="flex items-center space-x-4">
//                         <div className="flex items-center">
//                           <input
//                             id={`isActive-${index}`}
//                             name="isActive"
//                             type="checkbox"
//                             checked={method.isActive || false}
//                             onChange={(e) => handleChange(index, e)}
//                             className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                           />
//                           <label htmlFor={`isActive-${index}`} className="ml-2 block text-sm text-gray-900">
//                             Enable
//                           </label>
//                         </div>
                        
//                         <button
//                           type="button"
//                           onClick={() => removePaymentMethod(index)}
//                           className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
//                         >
//                           <FiTrash2 className="mr-1" /> Remove
//                         </button>
//                       </div>
//                     </div>
//                   </div>

//                   {renderMethodFields(method, index)}

//                   <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4 px-8 pb-6">
//                     <button
//                       type="button"
//                       onClick={handleReset}
//                       className="px-6 py-3 border border-gray-300 rounded-md text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     >
//                       Reset
//                     </button>
//                     <button
//                       type="submit"
//                       className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md shadow-sm hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500"
//                     >
//                       <FiSave className="inline mr-2" />
//                       Save Changes
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </form>
//           ) : (
//             <div className="space-y-8 p-8">
//               {/* Success alert - Only show if savedConfig exists */}
//               {savedConfig && (
//                 <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-6 shadow-sm">
//                   <div className="flex items-center">
//                     <FiCheckCircle className="h-6 w-6 text-green-500" />
//                     <div className="ml-3">
//                       <p className="text-sm font-medium text-green-800">
//                         Payment configuration is active and up to date!
//                       </p>
//                       <p className="mt-1 text-sm text-green-700">
//                         Last updated: {new Date(savedConfig.lastUpdated).toLocaleString()}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Payment methods overview */}
//               {savedConfig && (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {savedConfig.paymentMethods.map((method, index) => {
//                     const methodInfo = getMethodMetadata(method.type);
//                     return (
//                       <PaymentMethodCard 
//                         key={index}
//                         method={method}
//                         methodInfo={methodInfo}
//                         isActive={index === activeTab}
//                         onClick={() => setActiveTab(index)}
//                       />
//                     );
//                   })}
//                 </div>
//               )}

//               {/* Selected method details */}
//               {savedConfig && (
//                 <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
//                   <div className="p-6">
//                     {savedConfig.paymentMethods.map((method, index) => (
//                       <div key={index} className={activeTab === index ? 'block' : 'hidden'}>
//                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                           <div className="space-y-6">
//                             <div className="bg-gray-50 p-6 rounded-lg">
//                               <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
//                                 {getMethodIcon(method.type)}
//                                 <span className="ml-2">{getMethodLabel(method.type)} Details</span>
//                               </h3>
                              
//                               <dl className="space-y-4">
//                                 {method.type === 'mpesa_paybill' && (
//                                   <>
//                                     <div className="sm:grid sm:grid-cols-3 sm:gap-4">
//                                       <dt className="text-sm font-medium text-gray-700">Paybill Number</dt>
//                                       <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
//                                         {method.shortCode || 'Not configured'}
//                                       </dd>
//                                     </div>
//                                   </>
//                                 )}
                                
//                                 {method.type === 'bank' && (
//                                   <>
//                                     <div className="sm:grid sm:grid-cols-3 sm:gap-4">
//                                       <dt className="text-sm font-medium text-gray-700">Bank Name</dt>
//                                       <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
//                                         {method.bankName || 'Not configured'}
//                                       </dd>
//                                     </div>
//                                     <div className="sm:grid sm:grid-cols-3 sm:gap-4">
//                                       <dt className="text-sm font-medium text-gray-700">Account Number</dt>
//                                       <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
//                                         {method.accountNumber || 'Not configured'}
//                                       </dd>
//                                     </div>
//                                   </>
//                                 )}
                                
//                                 <div className="sm:grid sm:grid-cols-3 sm:gap-4">
//                                   <dt className="text-sm font-medium text-gray-700">Status</dt>
//                                   <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
//                                     {method.isActive ? (
//                                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                                         Active
//                                       </span>
//                                     ) : (
//                                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
//                                         Inactive
//                                       </span>
//                                     )}
//                                   </dd>
//                                 </div>
//                               </dl>
//                             </div>
                            
//                             <TestConnectionButton 
//                               methodType={method.type} 
//                               callbackUrl={method.callbackURL}
//                               fullWidth
//                             />
//                           </div>
                          
//                           <div className="space-y-6">
//                             <div className="bg-gray-50 p-6 rounded-lg">
//                               <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
//                                 <FiCode className="mr-2" />
//                                 Integration Details
//                               </h3>
                              
//                               <div className="space-y-4">
//                                 <div className="sm:grid sm:grid-cols-3 sm:gap-4">
//                                   <dt className="text-sm font-medium text-gray-700">Callback URL</dt>
//                                   <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 break-all">
//                                     {method.callbackURL ? (
//                                       <div className="bg-gray-100 p-3 rounded-md">
//                                         <div className="flex items-center justify-between">
//                                           <span className="truncate">{method.callbackURL}</span>
//                                           <button 
//                                             onClick={() => copyToClipboard(method.callbackURL)}
//                                             className="ml-2 text-gray-500 hover:text-gray-700 flex-shrink-0"
//                                             title="Copy to clipboard"
//                                           >
//                                             <FiCopy size={14} />
//                                           </button>
//                                         </div>
//                                       </div>
//                                     ) : 'Not configured'}
//                                   </dd>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
              
//               {/* Configuration history */}
//               <ConfigurationHistory history={history} />
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Add method modal */}
//       <AddMethodModal
//         isOpen={showAddModal}
//         onClose={() => setShowAddModal(false)}
//         paymentMethods={PAYMENT_METHODS}
//         currentMethods={config.paymentMethods}
//         selectedMethod={methodToAdd}
//         onSelectMethod={setMethodToAdd}
//         onConfirm={confirmAddPaymentMethod}
//       />

//       <ToastContainer position="top-right" autoClose={5000} />
//     </div>
//   );
// };

// export default PaymentConfiguration;







import React, { useState, useEffect } from 'react';
import {
  FiSave, FiRefreshCw, FiCheckCircle, FiPlus, FiTrash2,
  FiSmartphone, FiDollarSign, FiHome, FiEye, FiEyeOff, FiCode,
  FiInfo, FiShield, FiSettings, FiClipboard, FiEdit2, FiCopy,
  FiChevronRight, FiAlertCircle, FiZap, FiArrowLeft, FiCreditCard,
  FiChevronDown, FiChevronUp
} from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Puff } from 'react-loading-icons';
import api from '../../api';
import AdvancedSettings from '../../components/PaymentConfiguration/AdvancedSettings';
import BankSelector from '../../components/PaymentConfiguration/BankSelector';
import WebhookConfiguration from '../../components/PaymentConfiguration/WebhookConfiguration';
import PaymentMethodCard from '../../components/PaymentConfiguration/PaymentMethodCard';
import TestConnectionButton from '../../components/PaymentConfiguration/TestConnectionButton';
import SecurityBadge from '../../components/PaymentConfiguration/SecurityBadge';
import ConfigurationHistory from '../../components/PaymentConfiguration/ConfigurationHistory';
import PaymentConfigurationHeader from '../../components/PaymentConfiguration/PaymentConfigurationHeader';
import PaymentMethodTabs from '../../components/PaymentConfiguration/PaymentMethodTabs';
import AddMethodModal from '../../components/PaymentConfiguration/AddMethodModal';
import { PAYMENT_METHODS, KENYAN_BANKS } from '../../components/PaymentConfiguration/Utils/paymentConstants';
import { getMethodIcon, getMethodLabel, getMethodColor, getMethodGradient, getMethodMetadata } from '../../components/PaymentConfiguration/Utils/paymentUtils';

const PaymentConfiguration = () => {
  // State management
  const [config, setConfig] = useState({ paymentMethods: [], lastUpdated: new Date().toISOString() });
  const [savedConfig, setSavedConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showSecrets, setShowSecrets] = useState({});
  const [showAdvanced, setShowAdvanced] = useState({});
  const [history, setHistory] = useState([]);
  const [methodToAdd, setMethodToAdd] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Load initial data from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load payment gateways
        const gatewaysResponse = await api.get('/api/payments/gateways/');
        const gatewaysData = gatewaysResponse.data.gateways || [];
        
        // Load configuration history
        const historyResponse = await api.get('/api/payments/history/');
        const historyData = historyResponse.data.history || [];
        
        // Transform backend data to frontend format
        const transformedConfig = {
          paymentMethods: gatewaysData.map(gateway => ({
            id: gateway.id,
            type: gateway.name,
            isActive: gateway.is_active,
            sandboxMode: gateway.sandbox_mode,
            autoSettle: gateway.auto_settle,
            transactionLimit: gateway.transaction_limit,
            securityLevel: gateway.security_level,
            // Map specific configuration based on gateway type
            ...(gateway.name === 'mpesa_paybill' || gateway.name === 'mpesa_till' ? {
              shortCode: gateway.config?.paybill_number || gateway.config?.till_number,
              passKey: gateway.config?.passkey,
              callbackURL: gateway.config?.callback_url,
              webhookSecret: gateway.webhook_secret
            } : {}),
            ...(gateway.name === 'paypal' ? {
              clientId: gateway.config?.client_id,
              secret: gateway.config?.secret,
              merchantId: gateway.config?.merchant_id,
              callbackURL: gateway.config?.callback_url,
              webhookSecret: gateway.webhook_secret
            } : {}),
            ...(gateway.name === 'bank_transfer' ? {
              bankName: gateway.config?.bank_name,
              accountNumber: gateway.config?.account_number,
              accountName: gateway.config?.account_name,
              branchCode: gateway.config?.branch_code,
              swiftCode: gateway.config?.swift_code,
              callbackURL: gateway.config?.callback_url
            } : {})
          })),
          lastUpdated: new Date().toISOString()
        };
        
        setConfig(transformedConfig);
        setSavedConfig(transformedConfig);
        setHistory(historyData);
        setShowEditForm(false);
        setError(null);
      } catch (err) {
        setError('Failed to load configuration');
        showToast('Failed to load payment configuration', 'error');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Helper functions
  const showToast = (message, type = 'success') => {
    toast[type](message, {
      position: "top-right",
      autoClose: type === 'error' ? 5000 : 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });
  };

  const handleChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map((method, i) =>
        i === index ? { ...method, [name]: type === 'checkbox' ? checked : value } : method
      ),
      lastUpdated: new Date().toISOString()
    }));
  };

  const toggleSecretVisibility = (index) => {
    setShowSecrets(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleAdvancedSettings = (index) => {
    setShowAdvanced(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleMethodTypeChange = (index, value) => {
    setConfig(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map((method, i) =>
        i === index ? {
          ...method,
          type: value,
          isActive: method.isActive,
          sandboxMode: false,
          autoSettle: true,
          ...getDefaultValues(value)
        } : method
      ),
      lastUpdated: new Date().toISOString()
    }));
  };

  const getDefaultValues = (type) => {
    switch(type) {
      case 'mpesa_paybill':
        return {
          apiKey: '',
          secretKey: '',
          shortCode: '',
          passKey: '',
          callbackURL: '',
          webhookSecret: '',
          transactionLimit: '500000'
        };
      case 'mpesa_till':
        return {
          tillNumber: '',
          storeNumber: '',
          passKey: '',
          callbackURL: '',
          webhookSecret: '',
          transactionLimit: '200000'
        };
      case 'paypal':
        return {
          clientId: '',
          secret: '',
          merchantId: '',
          callbackURL: '',
          webhookSecret: '',
          transactionLimit: '10000'
        };
      case 'bank_transfer':
        return {
          bankName: '',
          accountNumber: '',
          accountName: '',
          branchCode: '',
          swiftCode: '',
          callbackURL: '',
          transactionLimit: '1000000'
        };
      default:
        return {};
    }
  };

  const generateCallbackUrl = async (index) => {
    try {
      const method = config.paymentMethods[index];
      const response = await api.post('/api/payments/webhooks/generate/', {
        gateway_id: method.id,
        callback_url: `${window.location.origin}/api/payments/callback/${method.type}`
      });
      
      const { callback_url, webhook_secret } = response.data;
      
      setConfig(prev => ({
        ...prev,
        paymentMethods: prev.paymentMethods.map((m, i) =>
          i === index ? { ...m, callbackURL: callback_url, webhookSecret: webhook_secret } : m
        ),
        lastUpdated: new Date().toISOString()
      }));
      
      showToast('Callback URL and webhook secret generated!');
    } catch (error) {
      showToast('Failed to generate webhook configuration', 'error');
      console.error('Error generating webhook:', error);
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'info');
  };

  const openAddMethodModal = () => {
    const available = Object.values(PAYMENT_METHODS).filter(
      method => !config.paymentMethods.some(m => m.type === method.value)
    );
    
    if (available.length === 0) {
      showToast('All payment methods already added', 'info');
      return;
    }
    
    setShowAddModal(true);
  };

  const confirmAddPaymentMethod = () => {
    if (!methodToAdd) return;
    
    setConfig(prev => ({
      ...prev,
      paymentMethods: [
        ...prev.paymentMethods,
        {
          type: methodToAdd,
          isActive: true,
          sandboxMode: false,
          autoSettle: true,
          ...getDefaultValues(methodToAdd)
        }
      ],
      lastUpdated: new Date().toISOString()
    }));
    
    setActiveTab(config.paymentMethods.length);
    setMethodToAdd(null);
    setShowAddModal(false);
    showToast(`${getMethodLabel(methodToAdd)} added successfully`);
  };

  const removePaymentMethod = async (index) => {
    if (config.paymentMethods.length <= 1) {
      showToast('You must have at least one payment method', 'error');
      return;
    }
    
    const method = config.paymentMethods[index];
    const methodName = getMethodLabel(method.type);
    
    try {
      if (method.id) {
        // Delete existing gateway from backend
        await api.delete(`/api/payments/gateways/${method.id}/`);
      }
      
      setConfig(prev => ({
        ...prev,
        paymentMethods: prev.paymentMethods.filter((_, i) => i !== index),
        lastUpdated: new Date().toISOString()
      }));
      
      if (activeTab >= index) {
        setActiveTab(Math.max(0, activeTab - 1));
      }
      
      showToast(`Removed ${methodName} payment method`, 'warning');
    } catch (error) {
      showToast(`Failed to remove ${methodName}`, 'error');
      console.error('Error removing payment method:', error);
    }
  };

  const validateConfig = () => {
    const errors = [];
    config.paymentMethods.forEach((method, index) => {
      if (!method.isActive) return;
      
      switch(method.type) {
        case 'mpesa_paybill':
          if (!method.shortCode || !method.passKey) {
            errors.push(`M-Pesa Paybill (${index + 1}) missing required fields`);
          }
          break;
        case 'mpesa_till':
          if (!method.tillNumber || !method.passKey) {
            errors.push(`M-Pesa Till (${index + 1}) missing required fields`);
          }
          break;
        case 'paypal':
          if (!method.clientId || !method.secret) {
            errors.push(`PayPal (${index + 1}) missing required fields`);
          }
          break;
        case 'bank_transfer':
          if (!method.bankName || !method.accountNumber) {
            errors.push(`Bank Transfer (${index + 1}) missing required fields`);
          }
          break;
      }
    });
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const errors = validateConfig();
    if (errors.length > 0) {
      setLoading(false);
      errors.forEach(err => showToast(err, 'error'));
      return;
    }
    
    try {
      // Save each payment method to backend
      for (const method of config.paymentMethods) {
        const gatewayData = {
          name: method.type,
          is_active: method.isActive,
          sandbox_mode: method.sandboxMode,
          transaction_limit: method.transactionLimit,
          auto_settle: method.autoSettle,
          security_level: method.securityLevel || 'medium'
        };
        
        if (method.id) {
          // Update existing gateway
          await api.put(`/api/payments/gateways/${method.id}/`, gatewayData);
          
          // Update specific configuration based on gateway type
          if (method.type === 'mpesa_paybill' || method.type === 'mpesa_till') {
            await api.patch(`/api/payments/gateways/${method.id}/mpesa/`, {
              paybill_number: method.type === 'mpesa_paybill' ? method.shortCode : null,
              till_number: method.type === 'mpesa_till' ? method.tillNumber : null,
              passkey: method.passKey,
              callback_url: method.callbackURL
            });
          } else if (method.type === 'paypal') {
            await api.patch(`/api/payments/gateways/${method.id}/paypal/`, {
              client_id: method.clientId,
              secret: method.secret,
              merchant_id: method.merchantId,
              callback_url: method.callbackURL
            });
          } else if (method.type === 'bank_transfer') {
            await api.patch(`/api/payments/gateways/${method.id}/bank/`, {
              bank_name: method.bankName,
              account_number: method.accountNumber,
              account_name: method.accountName,
              branch_code: method.branchCode,
              swift_code: method.swiftCode,
              callback_url: method.callbackURL
            });
          }
        } else {
          // Create new gateway
          const response = await api.post('/api/payments/gateways/', gatewayData);
          const newGatewayId = response.data.id;
          
          // Create specific configuration
          if (method.type === 'mpesa_paybill' || method.type === 'mpesa_till') {
            await api.post('/api/payments/gateways/mpesa/', {
              gateway: newGatewayId,
              paybill_number: method.type === 'mpesa_paybill' ? method.shortCode : null,
              till_number: method.type === 'mpesa_till' ? method.tillNumber : null,
              passkey: method.passKey,
              callback_url: method.callbackURL
            });
          } else if (method.type === 'paypal') {
            await api.post('/api/payments/gateways/paypal/', {
              gateway: newGatewayId,
              client_id: method.clientId,
              secret: method.secret,
              merchant_id: method.merchantId,
              callback_url: method.callbackURL
            });
          } else if (method.type === 'bank_transfer') {
            await api.post('/api/payments/gateways/bank/', {
              gateway: newGatewayId,
              bank_name: method.bankName,
              account_number: method.accountNumber,
              account_name: method.accountName,
              branch_code: method.branchCode,
              swift_code: method.swiftCode,
              callback_url: method.callbackURL
            });
          }
        }
      }
      
      // Reload data from backend
      const gatewaysResponse = await api.get('/api/payments/gateways/');
      const gatewaysData = gatewaysResponse.data.gateways || [];
      
      const transformedConfig = {
        paymentMethods: gatewaysData.map(gateway => ({
          id: gateway.id,
          type: gateway.name,
          isActive: gateway.is_active,
          sandboxMode: gateway.sandbox_mode,
          autoSettle: gateway.auto_settle,
          transactionLimit: gateway.transaction_limit,
          securityLevel: gateway.security_level,
          ...(gateway.name === 'mpesa_paybill' || gateway.name === 'mpesa_till' ? {
            shortCode: gateway.config?.paybill_number || gateway.config?.till_number,
            passKey: gateway.config?.passkey,
            callbackURL: gateway.config?.callback_url,
            webhookSecret: gateway.webhook_secret
          } : {}),
          ...(gateway.name === 'paypal' ? {
            clientId: gateway.config?.client_id,
            secret: gateway.config?.secret,
            merchantId: gateway.config?.merchant_id,
            callbackURL: gateway.config?.callback_url,
            webhookSecret: gateway.webhook_secret
          } : {}),
          ...(gateway.name === 'bank_transfer' ? {
            bankName: gateway.config?.bank_name,
            accountNumber: gateway.config?.account_number,
            accountName: gateway.config?.account_name,
            branchCode: gateway.config?.branch_code,
            swiftCode: gateway.config?.swift_code,
            callbackURL: gateway.config?.callback_url
          } : {})
        })),
        lastUpdated: new Date().toISOString()
      };
      
      setSavedConfig(transformedConfig);
      setConfig(transformedConfig);
      showToast('Configuration saved successfully!');
      setShowEditForm(false);
      
      // Reload history
      const historyResponse = await api.get('/api/payments/history/');
      setHistory(historyResponse.data.history || []);
      
    } catch (err) {
      showToast('Failed to save configuration', 'error');
      console.error('Error saving configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setConfig(savedConfig ? { ...savedConfig } : { paymentMethods: [], lastUpdated: new Date().toISOString() });
    showToast('Configuration reset to last saved state', 'info');
  };

  // Render method fields based on type
  const renderMethodFields = (method, index) => {
    const methodInfo = getMethodMetadata(method.type);
    
    return (
      <div className="space-y-6">
        {/* Method header */}
        <div className={`p-5 rounded-xl bg-gradient-to-r ${getMethodGradient(method.type)} text-white shadow-md`}>
          <div className="flex items-start">
            <div className="flex-shrink-0 p-2 bg-white bg-opacity-20 rounded-lg">
              {methodInfo.icon}
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-semibold">{methodInfo.label}</h3>
              <p className="mt-1 text-blue-100">{methodInfo.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
                  Currencies: {methodInfo.supportedCurrencies.join(', ')}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
                  Fees: {methodInfo.feeStructure}
                </span>
                <a 
                  href={methodInfo.documentationLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white hover:bg-opacity-30"
                >
                  View Documentation
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Method form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Credentials */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FiShield className="mr-2 text-blue-500" />
                Credentials
              </h3>
              
              {method.type === 'mpesa_paybill' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Paybill Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="shortCode"
                      value={method.shortCode || ''}
                      onChange={(e) => handleChange(index, e)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123456"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pass Key <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets[index] ? "text" : "password"}
                        name="passKey"
                        value={method.passKey || ''}
                        onChange={(e) => handleChange(index, e)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="bfb279f9aa9bdbcf..."
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecretVisibility(index)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {method.type === 'mpesa_till' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Till Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="tillNumber"
                      value={method.tillNumber || ''}
                      onChange={(e) => handleChange(index, e)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1234567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pass Key <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets[index] ? "text" : "password"}
                        name="passKey"
                        value={method.passKey || ''}
                        onChange={(e) => handleChange(index, e)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="bfb279f9aa9bdbcf..."
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecretVisibility(index)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {method.type === 'paypal' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="clientId"
                      value={method.clientId || ''}
                      onChange={(e) => handleChange(index, e)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="AeA9Q3hL9L1dL8QJ6..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Secret <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets[index] ? "text" : "password"}
                        name="secret"
                        value={method.secret || ''}
                        onChange={(e) => handleChange(index, e)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="EC-9QJ8QJ7QJ6QJ5..."
                      />
                      <button
                        type="button"
                        onClick={() => toggleSecretVisibility(index)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                      >
                        {showSecrets[index] ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {method.type === 'bank_transfer' && (
                <div className="space-y-4">
                  <BankSelector
                    value={method.bankName}
                    onChange={(e) => handleChange(index, e)}
                    index={index}
                    banks={KENYAN_BANKS}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={method.accountNumber || ''}
                      onChange={(e) => handleChange(index, e)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1234567890"
                    />
                  </div>
                </div>
              )}
            </div>

            <AdvancedSettings
              method={method}
              index={index}
              showAdvanced={showAdvanced[index]}
              toggleAdvancedSettings={() => toggleAdvancedSettings(index)}
              handleChange={handleChange}
              showSecrets={showSecrets[index]}
              toggleSecretVisibility={() => toggleSecretVisibility(index)}
              copyToClipboard={copyToClipboard}
            />
          </div>
          
          <div className="space-y-6">
            <WebhookConfiguration
              callbackUrl={method.callbackURL}
              onChange={(e) => handleChange(index, e)}
              index={index}
              generateCallbackUrl={() => generateCallbackUrl(index)}
              testConnection={
                <TestConnectionButton 
                  methodType={method.type} 
                  gatewayId={method.id}
                  callbackUrl={method.callbackURL}
                />
              }
              copyToClipboard={copyToClipboard}
            />
            
            {/* Security recommendations */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FiShield className="mr-2 text-red-500" />
                Security Recommendations
              </h3>
              
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start">
                  <SecurityBadge level="high" />
                  <span className="ml-2">Rotate API keys every 90 days</span>
                </li>
                <li className="flex items-start">
                  <SecurityBadge level="critical" />
                  <span className="ml-2">Never commit secrets to version control</span>
                </li>
                <li className="flex items-start">
                  <SecurityBadge level="medium" />
                  <span className="ml-2">Restrict IP access to payment endpoints</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <PaymentConfigurationHeader 
          savedConfig={savedConfig}
          showEditForm={showEditForm}
          onEdit={() => setShowEditForm(true)}
          onBack={() => setShowEditForm(false)}
        />

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-flex flex-col items-center justify-center space-y-4">
                <Puff stroke="#3B82F6" speed={1} />
                <div>
                  <h3 className="text-lg font-medium text-gray-700">Loading Payment Configuration</h3>
                  <p className="mt-1 text-sm text-gray-500">Securely fetching your payment settings...</p>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex items-center">
                <FiAlertCircle className="h-5 w-5 text-red-500" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : showEditForm ? (
            <form onSubmit={handleSubmit}>
              <PaymentMethodTabs
                methods={config.paymentMethods}
                activeTab={activeTab}
                onChangeTab={setActiveTab}
                onAddMethod={openAddMethodModal}
              />

              {config.paymentMethods.map((method, index) => (
                <div key={index} className={activeTab === index ? 'block' : 'hidden'}>
                  <div className="bg-gray-50 rounded-xl p-6 mb-8 shadow-inner">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Payment Method Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={method.type}
                          onChange={(e) => handleMethodTypeChange(index, e.target.value)}
                          className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          {Object.values(PAYMENT_METHODS).map((option, i) => (
                            <option key={i} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <input
                            id={`isActive-${index}`}
                            name="isActive"
                            type="checkbox"
                            checked={method.isActive || false}
                            onChange={(e) => handleChange(index, e)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`isActive-${index}`} className="ml-2 block text-sm text-gray-900">
                            Enable
                          </label>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => removePaymentMethod(index)}
                          className="inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <FiTrash2 className="mr-1" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  {renderMethodFields(method, index)}

                  <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4 px-8 pb-6">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-6 py-3 border border-gray-300 rounded-md text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-md shadow-sm hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <FiSave className="inline mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              ))}
            </form>
          ) : (
            <div className="space-y-8 p-8">
              {/* Success alert - Only show if savedConfig exists */}
              {savedConfig && savedConfig.paymentMethods.length > 0 && (
                <div className="bg-green-50 border-l-4 border-green-500 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center">
                    <FiCheckCircle className="h-6 w-6 text-green-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Payment configuration is active and up to date!
                      </p>
                      <p className="mt-1 text-sm text-green-700">
                        Last updated: {new Date(savedConfig.lastUpdated).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment methods overview */}
              {savedConfig && savedConfig.paymentMethods.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedConfig.paymentMethods.map((method, index) => {
                    const methodInfo = getMethodMetadata(method.type);
                    return (
                      <PaymentMethodCard 
                        key={index}
                        method={method}
                        methodInfo={methodInfo}
                        isActive={index === activeTab}
                        onClick={() => setActiveTab(index)}
                      />
                    );
                  })}
                </div>
              )}

              {/* Selected method details */}
              {savedConfig && savedConfig.paymentMethods.length > 0 && (
                <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
                  <div className="p-6">
                    {savedConfig.paymentMethods.map((method, index) => (
                      <div key={index} className={activeTab === index ? 'block' : 'hidden'}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            <div className="bg-gray-50 p-6 rounded-lg">
                              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                {getMethodIcon(method.type)}
                                <span className="ml-2">{getMethodLabel(method.type)} Details</span>
                              </h3>
                              
                              <dl className="space-y-4">
                                {method.type === 'mpesa_paybill' && (
                                  <>
                                    <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                                      <dt className="text-sm font-medium text-gray-700">Paybill Number</dt>
                                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {method.shortCode || 'Not configured'}
                                      </dd>
                                    </div>
                                  </>
                                )}
                                
                                {method.type === 'bank_transfer' && (
                                  <>
                                    <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                                      <dt className="text-sm font-medium text-gray-700">Bank Name</dt>
                                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {method.bankName || 'Not configured'}
                                      </dd>
                                    </div>
                                    <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                                      <dt className="text-sm font-medium text-gray-700">Account Number</dt>
                                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {method.accountNumber || 'Not configured'}
                                      </dd>
                                    </div>
                                  </>
                                )}
                                
                                <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                                  <dt className="text-sm font-medium text-gray-700">Status</dt>
                                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    {method.isActive ? (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Active
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        Inactive
                                      </span>
                                    )}
                                  </dd>
                                </div>
                              </dl>
                            </div>
                            
                            <TestConnectionButton 
                              methodType={method.type} 
                              gatewayId={method.id}
                              callbackUrl={method.callbackURL}
                              fullWidth
                            />
                          </div>
                          
                          <div className="space-y-6">
                            <div className="bg-gray-50 p-6 rounded-lg">
                              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <FiCode className="mr-2" />
                                Integration Details
                              </h3>
                              
                              <div className="space-y-4">
                                <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                                  <dt className="text-sm font-medium text-gray-700">Callback URL</dt>
                                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 break-all">
                                    {method.callbackURL ? (
                                      <div className="bg-gray-100 p-3 rounded-md">
                                        <div className="flex items-center justify-between">
                                          <span className="truncate">{method.callbackURL}</span>
                                          <button 
                                            onClick={() => copyToClipboard(method.callbackURL)}
                                            className="ml-2 text-gray-500 hover:text-gray-700 flex-shrink-0"
                                            title="Copy to clipboard"
                                          >
                                            <FiCopy size={14} />
                                          </button>
                                        </div>
                                      </div>
                                    ) : 'Not configured'}
                                  </dd>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Configuration history */}
              <ConfigurationHistory history={history} />
            </div>
          )}
        </div>
      </div>

      {/* Add method modal */}
      <AddMethodModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        paymentMethods={PAYMENT_METHODS}
        currentMethods={config.paymentMethods}
        selectedMethod={methodToAdd}
        onSelectMethod={setMethodToAdd}
        onConfirm={confirmAddPaymentMethod}
      />

      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default PaymentConfiguration;