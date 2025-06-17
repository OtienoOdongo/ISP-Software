// import React from 'react';
// import { FiX } from 'react-icons/fi';

// export const AddMethodModal = ({
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
//     <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
//         <div className="p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h3 className="text-lg font-medium text-gray-900">Add Payment Method</h3>
//             <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//               <FiX size={20} />
//             </button>
//           </div>
//           <p className="text-sm text-gray-500 mb-4">Select a payment method to add to your configuration:</p>
          
//           <div className="space-y-3">
//             {Object.values(paymentMethods)
//               .filter(method => !config.paymentMethods.some(pm => pm.type === method.value))
//               .map((method, i) => (
//                 <button
//                   key={i}
//                   type="button"
//                   onClick={() => setMethodToAdd(method.value)}
//                   className={`w-full flex items-center p-3 rounded-lg border ${methodToAdd === method.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
//                 >
//                   <span className={`flex-shrink-0 p-2 rounded-lg ${method.color} mr-3`}>
//                     {method.icon}
//                   </span>
//                   <div className="text-left">
//                     <h4 className="font-medium text-gray-900">{method.label}</h4>
//                     <p className="text-sm text-gray-500">{method.description}</p>
//                   </div>
//                 </button>
//               ))}
//           </div>
          
//           {Object.values(paymentMethods).every(method => 
//             config.paymentMethods.some(pm => pm.type === method.value)
//           ) && (
//             <p className="text-sm text-gray-500 mt-4">All available payment methods have been added.</p>
//           )}
          
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
//               onClick={confirmAddPaymentMethod}
//               disabled={!methodToAdd}
//               className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${methodToAdd ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
//             >
//               Add Method
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };




import React from 'react';
import PropTypes from 'prop-types';
import { FiX } from 'react-icons/fi';
import { getMethodIcon, getMethodColor } from './Utils/paymentUtils'

const AddMethodModal = ({
  show,
  onClose,
  paymentMethods,
  config,
  methodToAdd,
  setMethodToAdd,
  confirmAddPaymentMethod
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Add Payment Method</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none">
              <FiX size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">Select a payment method to add to your configuration:</p>
          
          <div className="space-y-3">
            {Object.values(paymentMethods)
              .filter(method => !config.paymentMethods.some(pm => pm.method_type === method.value))
              .map((method, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setMethodToAdd(method.value)}
                  className={`w-full flex items-center p-3 rounded-md border ${
                    methodToAdd === method.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className={`flex-shrink-0 p-2 rounded-md ${getMethodColor(method.value)} mr-3`}>
                    {getMethodIcon(method.value)}
                  </span>
                  <div className="text-left">
                    <h4 className="text-sm font-semibold text-gray-900">{method.label}</h4>
                    <p className="text-sm text-gray-500">{method.description || 'No description available'}</p>
                  </div>
                </button>
              ))}
          </div>
          
          {Object.values(paymentMethods).every(method => 
            config.paymentMethods.some(pm => pm.method_type === method.value)
          ) && (
            <p className="text-sm text-gray-600 mt-4">All available payment methods have been added.</p>
          )}
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmAddPaymentMethod}
              disabled={!methodToAdd}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                methodToAdd ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Add Method
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

AddMethodModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  paymentMethods: PropTypes.object.isRequired,
  config: PropTypes.shape({
    paymentMethods: PropTypes.arrayOf(
      PropTypes.shape({
        method_type: PropTypes.string
      })
    )
  }).isRequired,
  methodToAdd: PropTypes.string,
  setMethodToAdd: PropTypes.func.isRequired,
  confirmAddPaymentMethod: PropTypes.func.isRequired
};

export default AddMethodModal;