
// import React from 'react';
// import { FiCheck, FiX, FiShield } from 'react-icons/fi';
// import PropTypes from 'prop-types';
// import { getMethodIcon } from './Utils/paymentUtils';

// /**
//  * Card displaying payment method details.
//  */
// export const PaymentMethodCard = ({ method, methodInfo, isActive, onClick }) => {
//   return (
//     <div
//       onClick={onClick}
//       className={`flex p-4 items-start rounded-xl border-2 bg-white cursor-pointer transition-all duration-200 ${
//         isActive ? 'border-blue-500 bg-blue-50 shadow-sm transform scale-[1.02]' : 'border-gray-200 hover:bg-gray-50'
//       }`}
//     >
//       <div className={`flex items-center flex-shrink-0 justify-center p-3 rounded-lg shadow-sm ${methodInfo.color} mr-2`}>
//         {getMethodIcon(method.method_type)}
//       </div>
//       <div className="flex-1 min-w-0">
//         <h3 className="text-md font-semibold text-gray-900 truncate">{methodInfo.label || 'Unknown'}</h3>
//         <p className="text-sm text-gray-600 mt-1">{methodInfo.description || 'No description'}</p>
//         <div className="mt-2 flex flex-wrap gap-2">
//           {methodInfo?.supportedCurrencies?.map((currency, i) => (
//             <span
//               key={i}
//               className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800"
//             >
//               {currency}
//             </span>
//           )) || ''}
//         </div>
//         <div className="mt-3 pt-3 border-t border-gray-200">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-2">
//               <span
//                 className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-semibold ${
//                   method.sandbox_mode ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-500'
//                 }`}
//               >
//                 {method.sandbox_mode ? 'Sandbox' : 'Live'}
//               </span>
//               <span className="inline-flex items-center text-sm text-gray-500">
//                 <FiShield className="mr-1" />
//                 {method.is_active ? 'Success' : 'Failure'}
//               </span>
//             </div>
//             <span className="text-sm font-semibold text-gray-700">
//               {method.transaction_limit ? `KES ${parseInt(method.transaction_limit).toString()}` : 'KES No limit'}
//             </span>
//           </div>
//         </div>
//       </div>
//       <div className="ml-2">
//         {method.is_active ? <FiCheck className="text-green-600 h-5 w-5" /> : <FiX className="text-gray-600 h-5 w-5" />}
//       </div>
//     </div>
//   );
// };

// PaymentMethodCard.propTypes = {
//   method: PropTypes.shape({
//     method_type: PropTypes.string,
//     is_active: PropTypes.bool,
//     sandbox_mode: PropTypes.bool,
//     transaction_limit: PropTypes.string
//   }).isRequired,
//   methodInfo: PropTypes.shape({
//     label: PropTypes.string,
//     description: PropTypes.string,
//     color: PropTypes.string,
//     supportedCurrencies: PropTypes.arrayOf(PropTypes.string)
//   }).isRequired,
//   isActive: PropTypes.bool,
//   onClick: PropTypes.func.isRequired
// };

// export default PaymentMethodCard;





import React from 'react';
import { FiCheck, FiX, FiShield } from 'react-icons/fi';
import { getMethodIcon, getMethodLabel } from './Utils/paymentUtils';

const PaymentMethodCard = ({ method, methodInfo, isActive, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex p-5 items-start rounded-xl border-2 bg-white cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'border-blue-500 bg-blue-50 shadow-md transform scale-[1.02]' 
          : 'border-gray-200 hover:bg-gray-50 hover:shadow-sm'
      }`}
    >
      <div className={`flex-shrink-0 p-3 rounded-lg ${methodInfo.color} mr-4 shadow-sm`}>
        {getMethodIcon(method.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {getMethodLabel(method.type)}
          </h3>
          {method.isActive ? (
            <FiCheck className="text-green-500 h-5 w-5" />
          ) : (
            <FiX className="text-gray-400 h-5 w-5" />
          )}
        </div>
        
        <p className="mt-1 text-sm text-gray-600">{methodInfo.description}</p>
        
        <div className="mt-3 flex flex-wrap gap-2">
          {methodInfo.supportedCurrencies.map((currency, i) => (
            <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {currency}
            </span>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              method.sandboxMode ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}>
              {method.sandboxMode ? 'Sandbox' : 'Live'}
            </span>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 flex items-center">
                <FiShield className="mr-1" />
                Security
              </span>
              <span className="text-sm font-semibold text-gray-700">
                {method.transactionLimit ? `KES ${parseInt(method.transactionLimit).toLocaleString()}` : 'No limit'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodCard;