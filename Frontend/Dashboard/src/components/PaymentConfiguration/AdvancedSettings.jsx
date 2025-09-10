
// import React from 'react';
// import { FiSettings, FiCopy, FiEye, FiEyeOff } from 'react-icons/fi';
// import PropTypes from 'prop-types';

// /**
//  * Advanced settings for payment method configuration.
//  */
// export const AdvancedSettings = ({
//   method,
//   index,
//   showAdvanced,
//   toggleAdvancedSettings,
//   handleChange,
//   showSecrets,
//   toggleSecretVisibility,
//   copyToClipboard
// }) => (
//   <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//     <button
//       type="button"
//       onClick={toggleAdvancedSettings}
//       className="flex items-center justify-between w-full text-left"
//     >
//       <h3 className="text-lg font-medium text-gray-900 flex items-center">
//         <FiSettings className="mr-2 text-purple-500" />
//         Advanced Settings
//       </h3>
//       <svg
//         className={`h-5 w-5 text-gray-500 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
//         viewBox="0 0 20 20"
//         fill="currentColor"
//       >
//         <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
//       </svg>
//     </button>

//     {showAdvanced && (
//       <div className="mt-4 space-y-4">
//         <div>
//           <label htmlFor={`transaction_limit-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
//             Transaction Limit (KES)
//           </label>
//           <input
//             id={`transaction_limit-${index}`}
//             type="number"
//             name="transaction_limit"
//             value={method.transaction_limit || ''}
//             onChange={(e) => handleChange(index, e)}
//             className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//             placeholder="500000"
//           />
//           <p className="mt-1 text-xs text-gray-500">Maximum amount per transaction. Leave empty for no limit.</p>
//         </div>

//         <div className="flex items-center">
//           <input
//             id={`auto_settle-${index}`}
//             name="auto_settle"
//             type="checkbox"
//             checked={method.auto_settle || false}
//             onChange={(e) => handleChange(index, e)}
//             className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//           />
//           <label htmlFor={`auto_settle-${index}`} className="ml-2 block text-sm text-gray-900">
//             Auto-settle payments
//           </label>
//         </div>

//         <div>
//           <label htmlFor={`webhook_secret-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
//             Webhook Secret
//           </label>
//           <div className="relative">
//             <input
//               id={`webhook_secret-${index}`}
//               type={showSecrets ? "text" : "password"}
//               name="webhook_secret"
//               value={method.webhook_secret || ''}
//               onChange={(e) => handleChange(index, e)}
//               className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               placeholder="whsec_xxxxxxxxxxxxxx"
//               readOnly
//             />
//             <button
//               type="button"
//               onClick={() => copyToClipboard(method.webhook_secret)}
//               className="absolute inset-y-0 right-10 pr-3 flex items-center text-gray-500 hover:text-gray-700"
//               title="Copy to clipboard"
//             >
//               <FiCopy />
//             </button>
//             <button
//               type="button"
//               onClick={toggleSecretVisibility}
//               className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
//             >
//               {showSecrets ? <FiEyeOff /> : <FiEye />}
//             </button>
//           </div>
//           <p className="mt-1 text-xs text-gray-500">Used to verify webhook requests from the payment provider.</p>
//         </div>
//       </div>
//     )}
//   </div>
// );

// AdvancedSettings.propTypes = {
//   method: PropTypes.shape({
//     transaction_limit: PropTypes.string,
//     auto_settle: PropTypes.bool,
//     webhook_secret: PropTypes.string
//   }).isRequired,
//   index: PropTypes.number.isRequired,
//   showAdvanced: PropTypes.bool,
//   toggleAdvancedSettings: PropTypes.func.isRequired,
//   handleChange: PropTypes.func.isRequired,
//   showSecrets: PropTypes.bool,
//   toggleSecretVisibility: PropTypes.func.isRequired,
//   copyToClipboard: PropTypes.func.isRequired
// };

// export default AdvancedSettings;




import React from 'react';
import { 
  FiSettings, 
  FiCopy, 
  FiEye, 
  FiEyeOff,
  FiChevronUp,
  FiChevronDown 
} from 'react-icons/fi';

const AdvancedSettings = ({
  method = {},
  index = 0,
  showAdvanced = false,
  toggleAdvancedSettings,
  handleChange,
  showSecrets = {},
  toggleSecretVisibility,
  copyToClipboard
}) => {
  // Add defensive checks for showSecrets
  const isSecretVisible = showSecrets && typeof showSecrets[index] !== 'undefined' 
    ? showSecrets[index] 
    : false;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <button
        type="button"
        onClick={() => toggleAdvancedSettings(index)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <FiSettings className="mr-2 text-purple-500" />
          Advanced Settings
        </h3>
        {showAdvanced ? (
          <FiChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <FiChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>

      {showAdvanced && (
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor={`transactionLimit-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Limit (KES)
            </label>
            <input
              id={`transactionLimit-${index}`}
              type="number"
              name="transactionLimit"
              value={method.transactionLimit || ''}
              onChange={(e) => handleChange(index, e)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="500000"
            />
            <p className="mt-1 text-xs text-gray-500">Maximum amount per transaction</p>
          </div>

          <div className="flex items-center">
            <input
              id={`autoSettle-${index}`}
              name="autoSettle"
              type="checkbox"
              checked={method.autoSettle || false}
              onChange={(e) => handleChange(index, e)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor={`autoSettle-${index}`} className="ml-2 block text-sm text-gray-900">
              Auto-settle payments
            </label>
          </div>

          <div>
            <label htmlFor={`webhookSecret-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
              Webhook Secret
            </label>
            <div className="relative">
              <input
                id={`webhookSecret-${index}`}
                type={isSecretVisible ? "text" : "password"}
                name="webhookSecret"
                value={method.webhookSecret || ''}
                onChange={(e) => handleChange(index, e)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="whsec_xxxxxxxxxxxxxx"
                readOnly
              />
              <button
                type="button"
                onClick={() => copyToClipboard(method.webhookSecret)}
                className="absolute inset-y-0 right-10 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                title="Copy to clipboard"
              >
                <FiCopy />
              </button>
              <button
                type="button"
                onClick={() => toggleSecretVisibility(index)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {isSecretVisible ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Used to verify webhook requests</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSettings;