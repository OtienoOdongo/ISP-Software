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
//   setMethodToAdd
// }) => {
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
//             <h1 className="text-3xl font-bold text-gray-900 flex items-center">
//               <FiCreditCard className="mr-3 text-indigo-600" />
//               Payment Configuration
//             </h1>
//             <p className="mt-2 text-lg text-gray-600">
//               Manage your payment gateway integrations
//             </p>
//           </div>
          
//           <div className="flex flex-wrap gap-3">
//             <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex items-center">
//               <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 mr-3">
//                 <FiZap className="h-5 w-5" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-500">Active Methods</p>
//                 <p className="text-xl font-semibold text-gray-900">
//                   {savedConfig ? savedConfig.paymentMethods.filter(m => m.isActive).length : '0'}
//                 </p>
//               </div>
//             </div>
            
//             <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex items-center">
//               <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
//                 <FiShield className="h-5 w-5" />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-500">Security Status</p>
//                 <p className="text-xl font-semibold text-gray-900">
//                   {savedConfig ? 'Verified' : 'Pending'}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
        
//         <div className="mt-6 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 shadow-lg">
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
//           <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
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
//               <p className="text-sm text-gray-600 mb-6">
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
//                           ? 'border-blue-500 bg-blue-50 shadow-md'
//                           : 'border-gray-200 hover:bg-gray-50 hover:shadow-sm'
//                       }`}
//                     >
//                       <span className={`flex-shrink-0 p-3 rounded-full text-white ${getMethodColor(method.value)} mr-4`}>
//                         {getMethodIcon(method.value)}
//                       </span>
//                       <div className="text-left flex-grow">
//                         <h4 className="text-base font-semibold text-gray-900">{method.label}</h4>
//                         <p className="text-sm text-gray-500 mt-1">{method.description}</p>
//                       </div>
//                       {methodToAdd === method.value && (
//                         <FiChevronRight className="text-blue-500 ml-2" />
//                       )}
//                     </button>
//                   ))
//                 ) : (
//                   <div className="text-center py-8 bg-gray-50 rounded-lg">
//                     <p className="text-sm text-gray-500">
//                       All available payment methods have been added.
//                     </p>
//                   </div>
//                 )}
//               </div>
              
//               <div className="mt-8 flex justify-end space-x-4">
//                 <button
//                   type="button"
//                   onClick={() => setShowAddModal(false)}
//                   className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleConfirm}
//                   disabled={!methodToAdd || availableMethods.length === 0}
//                   className={`px-6 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm transition-colors ${
//                     methodToAdd && availableMethods.length > 0
//                       ? 'bg-blue-600 hover:bg-blue-700'
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





import React from 'react';
import { FiX, FiChevronRight, FiCreditCard, FiZap, FiShield, FiArrowLeft } from 'react-icons/fi';
import { getMethodIcon, getMethodColor } from './Utils/paymentUtils';
import { PAYMENT_METHODS } from './Utils/paymentConstants';

const PaymentConfigurationHeaderWithModal = ({ 
  savedConfig, 
  showEditForm, 
  currentMethods,
  onAddConfirm,
  onBack,
  setShowEditForm,
  showAddModal,
  setShowAddModal,
  methodToAdd,
  setMethodToAdd,
  theme = 'light'
}) => {
  // Theme-based CSS classes
  const titleClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-600';
  const cardClass = theme === 'dark' 
    ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700' 
    : 'bg-white border border-gray-200';
  const modalClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';

  const handleAdd = () => {
    setShowEditForm(true);
    setShowAddModal(true);
  };

  const handleConfirm = () => {
    if (methodToAdd) {
      onAddConfirm();
      setShowAddModal(false);
      setMethodToAdd(null);
    }
  };

  const availableMethods = Object.values(PAYMENT_METHODS).filter(
    method => !currentMethods.some(m => m.type === method.value)
  );

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
          
          <div className="flex flex-wrap gap-3">
            <div className={`rounded-lg shadow-sm p-4 border flex items-center ${cardClass}`}>
              <div className={`p-2 rounded-full mr-3 ${
                theme === 'dark' ? 'bg-indigo-900/50 text-indigo-400' : 'bg-indigo-100 text-indigo-600'
              }`}>
                <FiZap className="h-5 w-5" />
              </div>
              <div>
                <p className={`text-sm font-medium ${textClass}`}>Active Methods</p>
                <p className={`text-xl font-semibold ${titleClass}`}>
                  {savedConfig ? savedConfig.paymentMethods.filter(m => m.isActive).length : '0'}
                </p>
              </div>
            </div>
            
            <div className={`rounded-lg shadow-sm p-4 border flex items-center ${cardClass}`}>
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
              <h2 className="text-xl font-bold text-white">Payment Gateway Dashboard</h2>
              <p className="mt-2 text-blue-100 max-w-2xl">
                Configure and monitor all your payment integrations in one place
              </p>
            </div>
            
            {!showEditForm ? (
              <button
                onClick={handleAdd}
                className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-[1.02]"
              >
                <FiCreditCard className="mr-2 text-indigo-600" />
                Add Payment Method
              </button>
            ) : (
              <button
                onClick={onBack}
                className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-[1.02]"
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
                  onClick={() => setShowAddModal(false)}
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
                    <p className={`text-sm ${textClass}`}>
                      All available payment methods have been added.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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