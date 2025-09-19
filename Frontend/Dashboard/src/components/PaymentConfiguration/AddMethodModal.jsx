



// import React from 'react';
// import PropTypes from 'prop-types';
// import { FiX } from 'react-icons/fi';
// import { getMethodIcon, getMethodColor } from './Utils/paymentUtils'

// const AddMethodModal = ({
//   show,
//   onClose,
//   paymentMethods,
//   config,
//   methodToAdd,
//   setMethodToAdd,
//   confirmAddPaymentMethod
// }) => {
//   if (!show) return null;

//   return (
//     <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
//         <div className="p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-medium text-gray-900">Add Payment Method</h3>
//             <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none">
//               <FiX size={20} />
//             </button>
//           </div>
//           <p className="text-sm text-gray-600 mb-4">Select a payment method to add to your configuration:</p>
          
//           <div className="space-y-3">
//             {Object.values(paymentMethods)
//               .filter(method => !config.paymentMethods.some(pm => pm.method_type === method.value))
//               .map((method, index) => (
//                 <button
//                   key={index}
//                   type="button"
//                   onClick={() => setMethodToAdd(method.value)}
//                   className={`w-full flex items-center p-3 rounded-md border ${
//                     methodToAdd === method.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
//                   }`}
//                 >
//                   <span className={`flex-shrink-0 p-2 rounded-md ${getMethodColor(method.value)} mr-3`}>
//                     {getMethodIcon(method.value)}
//                   </span>
//                   <div className="text-left">
//                     <h4 className="text-sm font-semibold text-gray-900">{method.label}</h4>
//                     <p className="text-sm text-gray-500">{method.description || 'No description available'}</p>
//                   </div>
//                 </button>
//               ))}
//           </div>
          
//           {Object.values(paymentMethods).every(method => 
//             config.paymentMethods.some(pm => pm.method_type === method.value)
//           ) && (
//             <p className="text-sm text-gray-600 mt-4">All available payment methods have been added.</p>
//           )}
          
//           <div className="mt-6 flex justify-end space-x-3">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
//             >
//               Cancel
//             </button>
//             <button
//               type="button"
//               onClick={confirmAddPaymentMethod}
//               disabled={!methodToAdd}
//               className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
//                 methodToAdd ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
//               }`}
//             >
//               Add Method
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// AddMethodModal.propTypes = {
//   show: PropTypes.bool.isRequired,
//   onClose: PropTypes.func.isRequired,
//   paymentMethods: PropTypes.object.isRequired,
//   config: PropTypes.shape({
//     paymentMethods: PropTypes.arrayOf(
//       PropTypes.shape({
//         method_type: PropTypes.string
//       })
//     )
//   }).isRequired,
//   methodToAdd: PropTypes.string,
//   setMethodToAdd: PropTypes.func.isRequired,
//   confirmAddPaymentMethod: PropTypes.func.isRequired
// };

// export default AddMethodModal;





// import React from 'react';
// import { FiX } from 'react-icons/fi';
// import { getMethodIcon, getMethodColor } from './Utils/paymentUtils';

// const AddMethodModal = ({
//   isOpen,
//   onClose,
//   paymentMethods,
//   currentMethods,
//   selectedMethod,
//   onSelectMethod,
//   onConfirm
// }) => {
//   if (!isOpen) return null;

//   const availableMethods = Object.values(paymentMethods).filter(
//     method => !currentMethods.some(m => m.type === method.value)
//   );

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
//         <div className="p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-medium text-gray-900">Add Payment Method</h3>
//             <button 
//               onClick={onClose}
//               className="text-gray-400 hover:text-gray-500"
//             >
//               <FiX className="h-6 w-6" />
//             </button>
//           </div>
          
//           <p className="text-sm text-gray-500 mb-4">
//             Select a payment method to add to your configuration:
//           </p>
          
//           <div className="space-y-3">
//             {availableMethods.length > 0 ? (
//               availableMethods.map((method, index) => (
//                 <button
//                   key={index}
//                   type="button"
//                   onClick={() => onSelectMethod(method.value)}
//                   className={`w-full flex items-center p-4 rounded-lg border ${
//                     selectedMethod === method.value
//                       ? 'border-blue-500 bg-blue-50'
//                       : 'border-gray-200 hover:bg-gray-50'
//                   }`}
//                 >
//                   <span className={`flex-shrink-0 p-2 rounded-lg ${
//                     getMethodColor(method.value)
//                   } mr-3`}>
//                     {getMethodIcon(method.value)}
//                   </span>
//                   <div className="text-left">
//                     <h4 className="text-sm font-semibold text-gray-900">{method.label}</h4>
//                     <p className="text-sm text-gray-500">{method.description}</p>
//                   </div>
//                 </button>
//               ))
//             ) : (
//               <p className="text-sm text-gray-500 py-4 text-center">
//                 All available payment methods have been added.
//               </p>
//             )}
//           </div>
          
//           <div className="mt-6 flex justify-end space-x-3">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//             <button
//               type="button"
//               onClick={onConfirm}
//               disabled={!selectedMethod || availableMethods.length === 0}
//               className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
//                 selectedMethod && availableMethods.length > 0
//                   ? 'bg-blue-600 hover:bg-blue-700'
//                   : 'bg-gray-400 cursor-not-allowed'
//               }`}
//             >
//               Add Method
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddMethodModal;




import React from 'react';
import { FiX } from 'react-icons/fi';
import { getMethodIcon, getMethodColor } from './Utils/paymentUtils';

const AddMethodModal = ({
  isOpen,
  onClose,
  paymentMethods,
  currentMethods,
  selectedMethod,
  onSelectMethod,
  onConfirm
}) => {
  if (!isOpen) return null;

  const availableMethods = Object.values(paymentMethods).filter(
    method => !currentMethods.some(m => m.type === method.value)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Add Payment Method</h3>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6">
            Choose a payment method to integrate with your system. You'll configure it after adding.
          </p>
          
          <div className="space-y-4">
            {availableMethods.length > 0 ? (
              availableMethods.map((method, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onSelectMethod(method.value)}
                  className={`w-full flex items-center p-4 rounded-lg border transition-all duration-200 ${
                    selectedMethod === method.value
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <span className={`flex-shrink-0 p-3 rounded-full text-white ${getMethodColor(method.value)} mr-4`}>
                    {getMethodIcon(method.value)}
                  </span>
                  <div className="text-left flex-grow">
                    <h4 className="text-base font-semibold text-gray-900">{method.label}</h4>
                    <p className="text-sm text-gray-500 mt-1">{method.description}</p>
                  </div>
                  {selectedMethod === method.value && (
                    <FiChevronRight className="text-blue-500 ml-2" />
                  )}
                </button>
              ))
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">
                  All available payment methods have been added.
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={!selectedMethod || availableMethods.length === 0}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm transition-colors ${
                selectedMethod && availableMethods.length > 0
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Add Selected Method
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMethodModal;