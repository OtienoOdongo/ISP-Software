





// import React from 'react';
// import { FiX, FiChevronRight, FiCreditCard, FiZap, FiShield, FiArrowLeft } from 'react-icons/fi';
// import { getMethodIcon, getMethodColor } from './Utils/paymentUtils';
// import { PAYMENT_METHODS } from './Utils/paymentConstants';

// const PaymentConfigurationHeaderWithModal = ({ 
//   savedConfig, 
//   showEditForm, 
//   currentMethods,
//   onAddConfirm,
//   onBack,
//   setShowEditForm,
//   showAddModal,
//   setShowAddModal,
//   methodToAdd,
//   setMethodToAdd,
//   theme = 'light'
// }) => {
//   // Theme-based CSS classes
//   const titleClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
//   const textClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
//   const cardClass = theme === 'dark' 
//     ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700' 
//     : 'bg-white border border-gray-200';
//   const modalClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';

//   const handleAdd = () => {
//     setShowEditForm(true);
//     setShowAddModal(true);
//   };

//   const handleConfirm = () => {
//     if (methodToAdd) {
//       onAddConfirm();
//       setShowAddModal(false);
//       setMethodToAdd(null);
//     }
//   };

//   const availableMethods = Object.values(PAYMENT_METHODS).filter(
//     method => !currentMethods.some(m => m.type === method.value)
//   );

//   return (
//     <>
//       <div className="mb-8">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
//           <div>
//             <h1 className={`text-3xl font-bold flex items-center ${titleClass}`}>
//               <FiCreditCard className={`mr-3 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
//               Payment Configuration
//             </h1>
//             <p className={`mt-2 text-lg ${textClass}`}>
//               Manage your payment gateway integrations
//             </p>
//           </div>
          
//           <div className="flex flex-wrap gap-3">
//             <div className={`rounded-lg shadow-sm p-4 border flex items-center ${cardClass}`}>
//               <div className={`p-2 rounded-full mr-3 ${
//                 theme === 'dark' ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
//               }`}>
//                 <FiZap className="h-5 w-5" />
//               </div>
//               <div>
//                 <p className={`text-sm font-medium ${textClass}`}>Active Methods</p>
//                 <p className={`text-xl font-semibold ${titleClass}`}>
//                   {savedConfig ? savedConfig.paymentMethods.filter(m => m.isActive).length : '0'}
//                 </p>
//               </div>
//             </div>
            
//             <div className={`rounded-lg shadow-sm p-4 border flex items-center ${cardClass}`}>
//               <div className={`p-2 rounded-full mr-3 ${
//                 theme === 'dark' ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600'
//               }`}>
//                 <FiShield className="h-5 w-5" />
//               </div>
//               <div>
//                 <p className={`text-sm font-medium ${textClass}`}>Security Status</p>
//                 <p className={`text-xl font-semibold ${titleClass}`}>
//                   {savedConfig ? 'Verified' : 'Pending'}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
        
//         <div className={`mt-6 rounded-xl p-6 shadow-lg ${
//           theme === 'dark' ? 'bg-gradient-to-r from-indigo-900 to-blue-900' : 'bg-gradient-to-r from-indigo-600 to-blue-600'
//         }`}>
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between">
//             <div>
//               <h2 className="text-xl font-bold text-white">Payment Gateway Dashboard</h2>
//               <p className="mt-2 text-blue-100 max-w-2xl">
//                 Configure and monitor all your payment integrations in one place
//               </p>
//             </div>
            
//             {!showEditForm ? (
//               <button
//                 onClick={handleAdd}
//                 className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-[1.02]"
//               >
//                 <FiCreditCard className="mr-2 text-indigo-600" />
//                 Add Payment Method
//               </button>
//             ) : (
//               <button
//                 onClick={onBack}
//                 className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-[1.02]"
//               >
//                 <FiArrowLeft className="mr-2" />
//                 Back to Overview
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {showAddModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className={`rounded-xl shadow-xl w-full max-w-md overflow-hidden ${modalClass}`}>
//             <div className="p-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
//               <div className="flex justify-between items-center">
//                 <h3 className="text-lg font-medium">Add Payment Method</h3>
//                 <button 
//                   onClick={() => setShowAddModal(false)}
//                   className="text-white hover:text-gray-200 transition-colors"
//                 >
//                   <FiX className="h-6 w-6" />
//                 </button>
//               </div>
//             </div>
//             <div className="p-6">
//               <p className={`text-sm mb-6 ${textClass}`}>
//                 Choose a payment method to integrate with your system. You'll configure it after adding.
//               </p>
              
//               <div className="space-y-4">
//                 {availableMethods.length > 0 ? (
//                   availableMethods.map((method, index) => (
//                     <button
//                       key={index}
//                       type="button"
//                       onClick={() => setMethodToAdd(method.value)}
//                       className={`w-full flex items-center p-4 rounded-lg border transition-all duration-200 ${
//                         methodToAdd === method.value
//                           ? theme === 'dark'
//                             ? 'border-indigo-500 bg-indigo-900/30 shadow-md'
//                             : 'border-blue-500 bg-blue-50 shadow-md'
//                           : theme === 'dark'
//                             ? 'border-gray-600 hover:bg-gray-700/50 hover:shadow-sm'
//                             : 'border-gray-200 hover:bg-gray-50 hover:shadow-sm'
//                       }`}
//                     >
//                       <span className={`flex-shrink-0 p-3 rounded-full text-white ${getMethodColor(method.value)} mr-4`}>
//                         {getMethodIcon(method.value)}
//                       </span>
//                       <div className="text-left flex-grow">
//                         <h4 className={`text-base font-semibold ${titleClass}`}>{method.label}</h4>
//                         <p className={`text-sm mt-1 ${textClass}`}>{method.description}</p>
//                       </div>
//                       {methodToAdd === method.value && (
//                         <FiChevronRight className={theme === 'dark' ? 'text-indigo-400 ml-2' : 'text-blue-500 ml-2'} />
//                       )}
//                     </button>
//                   ))
//                 ) : (
//                   <div className={`text-center py-8 rounded-lg ${
//                     theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
//                   }`}>
//                     <p className={`text-sm ${textClass}`}>
//                       All available payment methods have been added.
//                     </p>
//                   </div>
//                 )}
//               </div>
              
//               <div className="mt-8 flex justify-end space-x-4">
//                 <button
//                   type="button"
//                   onClick={() => setShowAddModal(false)}
//                   className={`px-6 py-2.5 border rounded-lg text-sm font-medium transition-colors shadow-sm ${
//                     theme === 'dark'
//                       ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
//                       : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
//                   }`}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleConfirm}
//                   disabled={!methodToAdd || availableMethods.length === 0}
//                   className={`px-6 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm transition-colors ${
//                     methodToAdd && availableMethods.length > 0
//                       ? theme === 'dark'
//                         ? 'bg-indigo-600 hover:bg-indigo-700'
//                         : 'bg-blue-600 hover:bg-blue-700'
//                       : 'bg-gray-400 cursor-not-allowed'
//                   }`}
//                 >
//                   Add Selected Method
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default PaymentConfigurationHeaderWithModal;









// // src/components/PaymentConfiguration/PaymentConfigurationHeaderWithModal.jsx
// import React from 'react';
// import { FiX, FiChevronRight, FiCreditCard, FiZap, FiShield, FiArrowLeft } from 'react-icons/fi';
// import { getMethodIcon, getMethodColor } from './Utils/paymentUtils';
// import { PAYMENT_METHODS } from './Utils/paymentConstants';

// const PaymentConfigurationHeaderWithModal = ({ 
//   savedConfig, 
//   showEditForm, 
//   currentMethods,
//   onAddConfirm,
//   onBack,
//   setShowEditForm,
//   showAddModal,
//   setShowAddModal,
//   methodToAdd,
//   setMethodToAdd,
//   theme = 'light'
// }) => {
//   // Theme-based CSS classes
//   const titleClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
//   const textClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
//   const cardClass = theme === 'dark' 
//     ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700' 
//     : 'bg-white border border-gray-200';
//   const modalClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';

//   const handleAdd = () => {
//     setShowEditForm(true);
//     setShowAddModal(true);
//   };

//   const handleConfirm = () => {
//     if (methodToAdd) {
//       onAddConfirm(methodToAdd);
//     }
//   };

//   const availableMethods = Object.values(PAYMENT_METHODS).filter(
//     method => !currentMethods.some(m => m.type === method.value)
//   );

//   // FIXED: Calculate active methods count properly
//   const activeMethodsCount = savedConfig?.paymentMethods?.filter(m => m.isActive)?.length || 0;

//   return (
//     <>
//       <div className="mb-8">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
//           <div>
//             <h1 className={`text-3xl font-bold flex items-center ${titleClass}`}>
//               <FiCreditCard className={`mr-3 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
//               Payment Configuration
//             </h1>
//             <p className={`mt-2 text-lg ${textClass}`}>
//               Manage your payment gateway integrations
//             </p>
//           </div>
          
//           {/* FIXED: Mobile responsive stats cards - horizontal layout on mobile */}
//           <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//             <div className={`rounded-lg shadow-sm p-4 border flex items-center flex-1 sm:flex-none ${cardClass}`}>
//               <div className={`p-2 rounded-full mr-3 ${
//                 theme === 'dark' ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
//               }`}>
//                 <FiZap className="h-5 w-5" />
//               </div>
//               <div>
//                 <p className={`text-sm font-medium ${textClass}`}>Active Methods</p>
//                 <p className={`text-xl font-semibold ${titleClass}`}>
//                   {activeMethodsCount}
//                 </p>
//               </div>
//             </div>
            
//             <div className={`rounded-lg shadow-sm p-4 border flex items-center flex-1 sm:flex-none ${cardClass}`}>
//               <div className={`p-2 rounded-full mr-3 ${
//                 theme === 'dark' ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600'
//               }`}>
//                 <FiShield className="h-5 w-5" />
//               </div>
//               <div>
//                 <p className={`text-sm font-medium ${textClass}`}>Security Status</p>
//                 <p className={`text-xl font-semibold ${titleClass}`}>
//                   {savedConfig ? 'Verified' : 'Pending'}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
        
//         <div className={`mt-6 rounded-xl p-6 shadow-lg ${
//           theme === 'dark' ? 'bg-gradient-to-r from-indigo-900 to-blue-900' : 'bg-gradient-to-r from-indigo-600 to-blue-600'
//         }`}>
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between">
//             <div>
//               <h2 className="text-xl font-bold text-white">Payment Gateway </h2>
//               <p className="mt-2 text-blue-100 max-w-2xl">
//                 Configure and monitor all your payment integrations in one place
//               </p>
//             </div>
            
//             {!showEditForm ? (
//               <button
//                 onClick={handleAdd}
//                 className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-[1.02]"
//               >
//                 <FiCreditCard className="mr-2 text-indigo-600" />
//                 Add Payment Method
//               </button>
//             ) : (
//               <button
//                 onClick={onBack}
//                 className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-[1.02]"
//               >
//                 <FiArrowLeft className="mr-2" />
//                 Back to Overview
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {showAddModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className={`rounded-xl shadow-xl w-full max-w-md overflow-hidden ${modalClass}`}>
//             <div className="p-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
//               <div className="flex justify-between items-center">
//                 <h3 className="text-lg font-medium">Add Payment Method</h3>
//                 <button 
//                   onClick={() => setShowAddModal(false)}
//                   className="text-white hover:text-gray-200 transition-colors"
//                 >
//                   <FiX className="h-6 w-6" />
//                 </button>
//               </div>
//             </div>
//             <div className="p-6">
//               <p className={`text-sm mb-6 ${textClass}`}>
//                 Choose a payment method to integrate with your system. You'll configure it after adding.
//               </p>
              
//               <div className="space-y-4">
//                 {availableMethods.length > 0 ? (
//                   availableMethods.map((method, index) => (
//                     <button
//                       key={index}
//                       type="button"
//                       onClick={() => setMethodToAdd(method.value)}
//                       className={`w-full flex items-center p-4 rounded-lg border transition-all duration-200 ${
//                         methodToAdd === method.value
//                           ? theme === 'dark'
//                             ? 'border-indigo-500 bg-indigo-900/30 shadow-md'
//                             : 'border-blue-500 bg-blue-50 shadow-md'
//                           : theme === 'dark'
//                             ? 'border-gray-600 hover:bg-gray-700/50 hover:shadow-sm'
//                             : 'border-gray-200 hover:bg-gray-50 hover:shadow-sm'
//                       }`}
//                     >
//                       <span className={`flex-shrink-0 p-3 rounded-full text-white ${getMethodColor(method.value)} mr-4`}>
//                         {getMethodIcon(method.value)}
//                       </span>
//                       <div className="text-left flex-grow">
//                         <h4 className={`text-base font-semibold ${titleClass}`}>{method.label}</h4>
//                         <p className={`text-sm mt-1 ${textClass}`}>{method.description}</p>
//                       </div>
//                       {methodToAdd === method.value && (
//                         <FiChevronRight className={theme === 'dark' ? 'text-indigo-400 ml-2' : 'text-blue-500 ml-2'} />
//                       )}
//                     </button>
//                   ))
//                 ) : (
//                   <div className={`text-center py-8 rounded-lg ${
//                     theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
//                   }`}>
//                     <p className={`text-sm ${textClass}`}>
//                       All available payment methods have been added.
//                     </p>
//                   </div>
//                 )}
//               </div>
              
//               <div className="mt-8 flex justify-end space-x-4">
//                 <button
//                   type="button"
//                   onClick={() => setShowAddModal(false)}
//                   className={`px-6 py-2.5 border rounded-lg text-sm font-medium transition-colors shadow-sm ${
//                     theme === 'dark'
//                       ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
//                       : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
//                   }`}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleConfirm}
//                   disabled={!methodToAdd || availableMethods.length === 0}
//                   className={`px-6 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm transition-colors ${
//                     methodToAdd && availableMethods.length > 0
//                       ? theme === 'dark'
//                         ? 'bg-indigo-600 hover:bg-indigo-700'
//                         : 'bg-blue-600 hover:bg-blue-700'
//                       : 'bg-gray-400 cursor-not-allowed'
//                   }`}
//                 >
//                   Add Selected Method
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default PaymentConfigurationHeaderWithModal;






// // src/components/PaymentConfiguration/PaymentConfigurationHeaderWithModal.jsx
// import React from 'react';
// import { FiX, FiChevronRight, FiCreditCard, FiZap, FiShield, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
// import { getMethodIcon, getMethodColor } from './Utils/paymentUtils';
// import { PAYMENT_METHODS } from './Utils/paymentConstants';
// import toast from 'react-hot-toast';

// const PaymentConfigurationHeaderWithModal = ({ 
//   savedConfig, 
//   showEditForm, 
//   currentMethods = [],
//   onAddConfirm,
//   onBack,
//   setShowEditForm,
//   showAddModal,
//   setShowAddModal,
//   methodToAdd,
//   setMethodToAdd,
//   theme = 'light',
//   allMethodsAdded = false
// }) => {
//   const titleClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
//   const textClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
//   const cardClass = theme === 'dark' 
//     ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700' 
//     : 'bg-white border border-gray-200';
//   const modalClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';

//   const handleAdd = () => {
//     if (allMethodsAdded) {
//       // Show custom toast when all methods are added
//       toast.custom(
//         (t) => (
//           <div className={`p-4 rounded-lg shadow-lg max-w-sm mx-auto ${
//             theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
//           }`}>
//             <div className="flex items-start gap-3">
//               <div className="flex-shrink-0 mt-0.5">
//                 <FiCheckCircle className="w-5 h-5 text-green-500" />
//               </div>
//               <div className="flex-1">
//                 <div className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
//                   All methods added
//                 </div>
//                 <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
//                   There are no more payment methods available to add.
//                 </div>
//               </div>
//               <button
//                 onClick={() => toast.dismiss(t.id)}
//                 className={`flex-shrink-0 ${
//                   theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 <FiX className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         ),
//         { duration: 5000, position: 'top-center' }
//       );
//       return;
//     }
//     setShowAddModal(true);
//   };

//   const handleConfirm = () => {
//     if (methodToAdd) {
//       onAddConfirm(methodToAdd);
//       setShowAddModal(false);
//       setMethodToAdd(null);
//     }
//   };

//   const availableMethods = Object.values(PAYMENT_METHODS).filter(
//     method => !currentMethods.some(m => m.type === method.value)
//   );

//   const activeMethodsCount = savedConfig?.paymentMethods?.filter(m => m.isActive)?.length || 0;

//   return (
//     <>
//       <div className="mb-8">
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
//           <div>
//             <h1 className={`text-3xl font-bold flex items-center ${titleClass}`}>
//               <FiCreditCard className={`mr-3 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
//               Payment Configuration
//             </h1>
//             <p className={`mt-2 text-lg ${textClass}`}>
//               Manage your payment gateway integrations
//             </p>
//           </div>

//           <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//             <div className={`rounded-lg shadow-sm p-4 border flex items-center flex-1 sm:flex-none ${cardClass}`}>
//               <div className={`p-2 rounded-full mr-3 ${
//                 theme === 'dark' ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
//               }`}>
//                 <FiZap className="h-5 w-5" />
//               </div>
//               <div>
//                 <p className={`text-sm font-medium ${textClass}`}>Active Methods</p>
//                 <p className={`text-xl font-semibold ${titleClass}`}>
//                   {activeMethodsCount}
//                 </p>
//               </div>
//             </div>

//             <div className={`rounded-lg shadow-sm p-4 border flex items-center flex-1 sm:flex-none ${cardClass}`}>
//               <div className={`p-2 rounded-full mr-3 ${
//                 theme === 'dark' ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600'
//               }`}>
//                 <FiShield className="h-5 w-5" />
//               </div>
//               <div>
//                 <p className={`text-sm font-medium ${textClass}`}>Security Status</p>
//                 <p className={`text-xl font-semibold ${titleClass}`}>
//                   {savedConfig ? 'Verified' : 'Pending'}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className={`mt-6 rounded-xl p-6 shadow-lg ${
//           theme === 'dark' ? 'bg-gradient-to-r from-indigo-900 to-blue-900' : 'bg-gradient-to-r from-indigo-600 to-blue-600'
//         }`}>
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between">
//             <div>
//               <h2 className="text-xl font-bold text-white">Payment Gateway</h2>
//               <p className="mt-2 text-blue-100 max-w-2xl">
//                 Configure and monitor all your payment integrations in one place
//               </p>
//             </div>

//             {!showEditForm ? (
//               <button
//                 onClick={handleAdd}
//                 type="button"
//                 disabled={allMethodsAdded}
//                 className={`mt-4 md:mt-0 inline-flex items-center px-6 py-3 text-base font-medium rounded-xl shadow-sm focus:outline-none transition-all hover:scale-[1.02] ${
//                   allMethodsAdded
//                     ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
//                     : theme === 'dark' 
//                       ? 'bg-gray-900 text-white hover:bg-gray-800' 
//                       : 'text-indigo-700 bg-white hover:bg-indigo-50'
//                 }`}
//               >
//                 <FiCreditCard className={`mr-2 ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'}`} />
//                 {allMethodsAdded ? 'All Methods Added' : 'Add Payment Method'}
//               </button>
//             ) : (
//               <button
//                 onClick={onBack}
//                 type="button"
//                 className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 text-base font-medium rounded-xl shadow-sm text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none transition-all hover:scale-[1.02]"
//               >
//                 <FiArrowLeft className="mr-2" />
//                 Back to Overview
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {showAddModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className={`rounded-xl shadow-xl w-full max-w-md overflow-hidden ${modalClass}`}>
//             <div className="p-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
//               <div className="flex justify-between items-center">
//                 <h3 className="text-lg font-medium">Add Payment Method</h3>
//                 <button 
//                   onClick={() => { setShowAddModal(false); setMethodToAdd(null); }}
//                   className="text-white hover:text-gray-200 transition-colors"
//                 >
//                   <FiX className="h-6 w-6" />
//                 </button>
//               </div>
//             </div>
//             <div className="p-6">
//               <p className={`text-sm mb-6 ${textClass}`}>
//                 Choose a payment method to integrate with your system. You'll configure it after adding.
//               </p>

//               <div className="space-y-4">
//                 {availableMethods.length > 0 ? (
//                   availableMethods.map((method, index) => (
//                     <button
//                       key={index}
//                       type="button"
//                       onClick={() => setMethodToAdd(method.value)}
//                       className={`w-full flex items-center p-4 rounded-lg border transition-all duration-200 ${
//                         methodToAdd === method.value
//                           ? theme === 'dark'
//                             ? 'border-indigo-500 bg-indigo-900/30 shadow-md'
//                             : 'border-blue-500 bg-blue-50 shadow-md'
//                           : theme === 'dark'
//                             ? 'border-gray-600 hover:bg-gray-700/50 hover:shadow-sm'
//                             : 'border-gray-200 hover:bg-gray-50 hover:shadow-sm'
//                       }`}
//                     >
//                       <span className={`flex-shrink-0 p-3 rounded-full text-white ${getMethodColor(method.value)} mr-4`}>
//                         {getMethodIcon(method.value)}
//                       </span>
//                       <div className="text-left flex-grow">
//                         <h4 className={`text-base font-semibold ${titleClass}`}>{method.label}</h4>
//                         <p className={`text-sm mt-1 ${textClass}`}>{method.description}</p>
//                       </div>
//                       {methodToAdd === method.value && (
//                         <FiChevronRight className={theme === 'dark' ? 'text-indigo-400 ml-2' : 'text-blue-500 ml-2'} />
//                       )}
//                     </button>
//                   ))
//                 ) : (
//                   <div className={`text-center py-8 rounded-lg ${
//                     theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
//                   }`}>
//                     <FiCheckCircle className={`mx-auto h-8 w-8 mb-2 ${
//                       theme === 'dark' ? 'text-green-400' : 'text-green-500'
//                     }`} />
//                     <p className={`text-sm font-medium ${titleClass}`}>All methods added</p>
//                     <p className={`text-xs mt-1 ${textClass}`}>
//                       There are no more payment methods available to add.
//                     </p>
//                   </div>
//                 )}
//               </div>

//               <div className="mt-8 flex justify-end space-x-4">
//                 <button
//                   type="button"
//                   onClick={() => { setShowAddModal(false); setMethodToAdd(null); }}
//                   className={`px-6 py-2.5 border rounded-lg text-sm font-medium transition-colors shadow-sm ${
//                     theme === 'dark'
//                       ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
//                       : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
//                   }`}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleConfirm}
//                   disabled={!methodToAdd || availableMethods.length === 0}
//                   className={`px-6 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm transition-colors ${
//                     methodToAdd && availableMethods.length > 0
//                       ? theme === 'dark'
//                         ? 'bg-indigo-600 hover:bg-indigo-700'
//                         : 'bg-blue-600 hover:bg-blue-700'
//                       : 'bg-gray-400 cursor-not-allowed'
//                   }`}
//                 >
//                   Add Selected Method
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default PaymentConfigurationHeaderWithModal;








// src/components/PaymentConfiguration/PaymentConfigurationHeaderWithModal.jsx
import React from 'react';
import { FiX, FiChevronRight, FiCreditCard, FiZap, FiShield, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { getMethodIcon, getMethodColor } from './Utils/paymentUtils';
import { PAYMENT_METHODS } from './Utils/paymentConstants';
import toast from 'react-hot-toast';

const PaymentConfigurationHeaderWithModal = ({ 
  savedConfig, 
  showEditForm, 
  currentMethods = [],
  onAddConfirm,
  onBack,
  setShowEditForm,
  showAddModal,
  setShowAddModal,
  methodToAdd,
  setMethodToAdd,
  theme = 'light',
  allMethodsAdded = false
}) => {
  const titleClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const cardClass = theme === 'dark' 
    ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700' 
    : 'bg-white border border-gray-200';
  const modalClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';

  const handleAdd = () => {
    if (allMethodsAdded) {
      // Show custom toast when all methods are added and user tries to add more
      toast.custom(
        t => (
          <div className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-md flex items-start gap-3 max-w-sm mx-auto">
            <div className="flex-shrink-0 mt-0.5">
              <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-300" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">All methods added</div>
              <div className="text-xs text-gray-700 dark:text-gray-300">There are no more payment methods available to add.</div>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        ),
        { 
          duration: 5000,
          position: 'top-center'
        }
      );
      return;
    }
    setShowAddModal(true);
  };

  const handleConfirm = () => {
    if (methodToAdd) {
      onAddConfirm(methodToAdd);
      setShowAddModal(false);
      setMethodToAdd(null);
      setShowEditForm(true);
      toast.success('Payment method added successfully.');

      // Check if this was the last available method
      const remainingMethods = Object.values(PAYMENT_METHODS).filter(
        method => ![...currentMethods, { type: methodToAdd }].some(m => m.type === method.value)
      );

      if (remainingMethods.length === 0) {
        setTimeout(() => {
          toast.custom(
            t => (
              <div className="p-3 rounded-lg bg-white dark:bg-gray-800 shadow-md flex items-start gap-3 max-w-sm mx-auto">
                <div className="flex-shrink-0 mt-0.5">
                  <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-300" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">All methods added</div>
                  <div className="text-xs text-gray-700 dark:text-gray-300">There are no more payment methods available to add.</div>
                </div>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ),
            { 
              duration: 5000,
              position: 'top-center'
            }
          );
        }, 500);
      }
    }
  };

  const availableMethods = Object.values(PAYMENT_METHODS).filter(
    method => !currentMethods.some(m => m.type === method.value)
  );

  const activeMethodsCount = savedConfig?.paymentMethods?.filter(m => m.isActive)?.length || 0;

  return (
    <>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className={`text-3xl font-bold flex items-center ${titleClass}`}>
              <FiCreditCard className={`mr-3 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
              Payment Configuration
            </h1>
            <p className={`mt-2 text-lg ${textClass}`}>
              Manage your payment gateway integrations
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className={`rounded-lg shadow-sm p-4 border flex items-center flex-1 sm:flex-none ${cardClass}`}>
              <div className={`p-2 rounded-full mr-3 ${
                theme === 'dark' ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
              }`}>
                <FiZap className="h-5 w-5" />
              </div>
              <div>
                <p className={`text-sm font-medium ${textClass}`}>Active Methods</p>
                <p className={`text-xl font-semibold ${titleClass}`}>
                  {activeMethodsCount}
                </p>
              </div>
            </div>

            <div className={`rounded-lg shadow-sm p-4 border flex items-center flex-1 sm:flex-none ${cardClass}`}>
              <div className={`p-2 rounded-full mr-3 ${
                theme === 'dark' ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600'
              }`}>
                <FiShield className="h-5 w-5" />
              </div>
              <div>
                <p className={`text-sm font-medium ${textClass}`}>Security Status</p>
                <p className={`text-xl font-semibold ${titleClass}`}>
                  {savedConfig ? 'Verified' : 'Pending'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={`mt-6 rounded-xl p-6 shadow-lg ${
          theme === 'dark' ? 'bg-gradient-to-r from-indigo-900 to-blue-900' : 'bg-gradient-to-r from-indigo-600 to-blue-600'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Payment Gateway</h2>
              <p className="mt-2 text-blue-100 max-w-2xl">
                Configure and monitor all your payment integrations in one place
              </p>
            </div>

            {!showEditForm ? (
              <button
                onClick={handleAdd}
                type="button"
                disabled={allMethodsAdded}
                className={`mt-4 md:mt-0 inline-flex items-center px-6 py-3 text-base font-medium rounded-xl shadow-sm focus:outline-none transition-all hover:scale-[1.02] ${
                  allMethodsAdded
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed opacity-60'
                    : theme === 'dark' 
                      ? 'bg-gray-900 text-white hover:bg-gray-800' 
                      : 'text-indigo-700 bg-white hover:bg-indigo-50'
                }`}
              >
                <FiCreditCard className={`mr-2 ${
                  allMethodsAdded 
                    ? 'text-gray-500' 
                    : theme === 'dark' ? 'text-indigo-300' : 'text-indigo-600'
                }`} />
                {allMethodsAdded ? 'All Methods Added' : 'Add Payment Method'}
              </button>
            ) : (
              <button
                onClick={onBack}
                type="button"
                className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 text-base font-medium rounded-xl shadow-sm text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none transition-all hover:scale-[1.02]"
              >
                <FiArrowLeft className="mr-2" />
                Back to Overview
              </button>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl shadow-xl w-full max-w-md overflow-hidden ${modalClass}`}>
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Add Payment Method</h3>
                <button 
                  onClick={() => { setShowAddModal(false); setMethodToAdd(null); }}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className={`text-sm mb-6 ${textClass}`}>
                Choose a payment method to integrate with your system. You'll configure it after adding.
              </p>

              <div className="space-y-4">
                {availableMethods.length > 0 ? (
                  availableMethods.map((method, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setMethodToAdd(method.value)}
                      className={`w-full flex items-center p-4 rounded-lg border transition-all duration-200 ${
                        methodToAdd === method.value
                          ? theme === 'dark'
                            ? 'border-indigo-500 bg-indigo-900/30 shadow-md'
                            : 'border-blue-500 bg-blue-50 shadow-md'
                          : theme === 'dark'
                            ? 'border-gray-600 hover:bg-gray-700/50 hover:shadow-sm'
                            : 'border-gray-200 hover:bg-gray-50 hover:shadow-sm'
                      }`}
                    >
                      <span className={`flex-shrink-0 p-3 rounded-full text-white ${getMethodColor(method.value)} mr-4`}>
                        {getMethodIcon(method.value)}
                      </span>
                      <div className="text-left flex-grow">
                        <h4 className={`text-base font-semibold ${titleClass}`}>{method.label}</h4>
                        <p className={`text-sm mt-1 ${textClass}`}>{method.description}</p>
                      </div>
                      {methodToAdd === method.value && (
                        <FiChevronRight className={theme === 'dark' ? 'text-indigo-400 ml-2' : 'text-blue-500 ml-2'} />
                      )}
                    </button>
                  ))
                ) : (
                  <div className={`text-center py-8 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <FiCheckCircle className={`mx-auto h-8 w-8 mb-2 ${
                      theme === 'dark' ? 'text-green-400' : 'text-green-500'
                    }`} />
                    <p className={`text-sm font-medium ${titleClass}`}>All methods added</p>
                    <p className={`text-xs mt-1 ${textClass}`}>
                      There are no more payment methods available to add.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setMethodToAdd(null); }}
                  className={`px-6 py-2.5 border rounded-lg text-sm font-medium transition-colors shadow-sm ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={!methodToAdd || availableMethods.length === 0}
                  className={`px-6 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm transition-colors ${
                    methodToAdd && availableMethods.length > 0
                      ? theme === 'dark'
                        ? 'bg-indigo-600 hover:bg-indigo-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Add Selected Method
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentConfigurationHeaderWithModal;