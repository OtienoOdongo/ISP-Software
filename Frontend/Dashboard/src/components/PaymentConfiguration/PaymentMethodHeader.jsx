// import React from 'react';
// import { getMethodIcon, getMethodLabel, getMethodGradient } from './Utils/paymentUtils'

// export const PaymentMethodHeader = ({ methodType, description, supportedCurrencies, feeStructure, documentationLink }) => (
//   <div className={`p-5 rounded-xl bg-gradient-to-r ${getMethodGradient(methodType)} text-white shadow-md`}>
//     <div className="flex items-start">
//       <div className="flex-shrink-0 p-2 bg-white bg-opacity-20 rounded-lg">
//         {getMethodIcon(methodType)}
//       </div>
//       <div className="ml-4">
//         <h3 className="text-xl font-semibold">{getMethodLabel(methodType)}</h3>
//         <p className="mt-1 text-blue-100">{description}</p>
//         <div className="mt-3 flex flex-wrap gap-2">
//           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
//             Currencies: {supportedCurrencies.join(', ')}
//           </span>
//           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
//             Fees: {feeStructure}
//           </span>
//           <a 
//             href={documentationLink} 
//             target="_blank" 
//             rel="noopener noreferrer"
//             className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white hover:bg-opacity-30"
//           >
//             View Documentation
//           </a>
//         </div>
//       </div>
//     </div>
//   </div>
// );


import React from 'react';
import PropTypes from 'prop-types';
import { getMethodIcon, getMethodLabel, getMethodGradient } from './Utils/paymentUtils';

/**
 * Header for payment method configuration.
 */
const PaymentMethodHeader = ({ methodType, description, supportedCurrencies, feeStructure, documentationLink }) => (
  <div className={`p-5 rounded-xl bg-gradient-to-r ${getMethodGradient(methodType)} text-white shadow-md`}>
    <div className="flex items-start">
      <div className="flex-shrink-0 p-2 bg-white bg-opacity-20 rounded-lg">
        {getMethodIcon(methodType)}
      </div>
      <div className="ml-4">
        <h3 className="text-xl font-semibold">{getMethodLabel(methodType)}</h3>
        <p className="mt-1 text-blue-100">{description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
            Currencies: {supportedCurrencies.join(', ')}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white bg-opacity-20 text-white">
            Fees: {feeStructure}
          </span>
          <a
            href={documentationLink}
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
);

PaymentMethodHeader.propTypes = {
  methodType: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  supportedCurrencies: PropTypes.arrayOf(PropTypes.string).isRequired,
  feeStructure: PropTypes.string.isRequired,
  documentationLink: PropTypes.string.isRequired,
};

export default PaymentMethodHeader;