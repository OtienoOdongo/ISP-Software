








// import React from 'react';
// import { 
//   FiSettings, 
//   FiCopy, 
//   FiEye, 
//   FiEyeOff,
//   FiChevronUp,
//   FiChevronDown 
// } from 'react-icons/fi';

// const AdvancedSettings = ({
//   method = {},
//   index = 0,
//   showAdvanced = false,
//   toggleAdvancedSettings,
//   handleChange,
//   showSecrets = {},
//   toggleSecretVisibility,
//   copyToClipboard,
//   theme = 'light'
// }) => {
//   // Theme-based CSS classes
//   const cardClass = theme === 'dark'
//     ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700'
//     : 'bg-white border border-gray-200';

//   const inputClass = theme === 'dark'
//     ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
//     : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

//   const textClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
//   const titleClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
//   const iconClass = theme === 'dark' ? 'text-purple-400' : 'text-purple-500';
//   const helperTextClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

//   // Add defensive checks for showSecrets
//   const isSecretVisible = showSecrets && typeof showSecrets[index] !== 'undefined' 
//     ? showSecrets[index] 
//     : false;

//   return (
//     <div className={`p-6 rounded-xl shadow-md ${cardClass}`}>
//       <button
//         type="button"
//         onClick={() => toggleAdvancedSettings(index)}
//         className="flex items-center justify-between w-full text-left"
//       >
//         <h3 className={`text-lg font-medium flex items-center ${titleClass}`}>
//           <FiSettings className={`mr-2 ${iconClass}`} />
//           Advanced Settings
//         </h3>
//         {showAdvanced ? (
//           <FiChevronUp className={`h-5 w-5 ${helperTextClass}`} />
//         ) : (
//           <FiChevronDown className={`h-5 w-5 ${helperTextClass}`} />
//         )}
//       </button>

//       {showAdvanced && (
//         <div className="mt-4 space-y-4">
//           <div>
//             <label htmlFor={`transactionLimit-${index}`} className={`block text-sm font-medium mb-1 ${textClass}`}>
//               Transaction Limit (KES)
//             </label>
//             <input
//               id={`transactionLimit-${index}`}
//               type="number"
//               name="transactionLimit"
//               value={method.transactionLimit || ''}
//               onChange={(e) => handleChange(index, e)}
//               className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none transition-colors ${inputClass}`}
//               placeholder="500000"
//             />
//             <p className={`mt-1 text-xs ${helperTextClass}`}>Maximum amount per transaction</p>
//           </div>

//           <div className="flex items-center">
//             <input
//               id={`autoSettle-${index}`}
//               name="autoSettle"
//               type="checkbox"
//               checked={method.autoSettle || false}
//               onChange={(e) => handleChange(index, e)}
//               className={`h-4 w-4 rounded focus:ring-2 ${
//                 theme === 'dark' 
//                   ? 'text-indigo-500 focus:ring-indigo-500 border-gray-600 bg-gray-700' 
//                   : 'text-blue-600 focus:ring-blue-500 border-gray-300'
//               }`}
//             />
//             <label htmlFor={`autoSettle-${index}`} className={`ml-2 block text-sm ${titleClass}`}>
//               Auto-settle payments
//             </label>
//           </div>

//           <div>
//             <label htmlFor={`webhookSecret-${index}`} className={`block text-sm font-medium mb-1 ${textClass}`}>
//               Webhook Secret
//             </label>
//             <div className="relative">
//               <input
//                 id={`webhookSecret-${index}`}
//                 type={isSecretVisible ? "text" : "password"}
//                 name="webhookSecret"
//                 value={method.webhookSecret || ''}
//                 onChange={(e) => handleChange(index, e)}
//                 className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none transition-colors pr-20 ${inputClass}`}
//                 placeholder="whsec_xxxxxxxxxxxxxx"
//                 readOnly
//               />
//               <button
//                 type="button"
//                 onClick={() => copyToClipboard(method.webhookSecret)}
//                 className={`absolute inset-y-0 right-10 pr-3 flex items-center transition-colors ${
//                   theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                 }`}
//                 title="Copy to clipboard"
//               >
//                 <FiCopy />
//               </button>
//               <button
//                 type="button"
//                 onClick={() => toggleSecretVisibility(index)}
//                 className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
//                   theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 {isSecretVisible ? <FiEyeOff /> : <FiEye />}
//               </button>
//             </div>
//             <p className={`mt-1 text-xs ${helperTextClass}`}>Used to verify webhook requests</p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdvancedSettings;










// src/components/PaymentConfiguration/AdvancedSettings.jsx
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
  showSecrets = false,
  toggleSecretVisibility,
  copyToClipboard,
  theme = 'light'
}) => {
  // Theme-based CSS classes
  const cardClass = theme === 'dark'
    ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700'
    : 'bg-white border border-gray-200';

  const inputClass = theme === 'dark'
    ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
    : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

  const textClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const titleClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const iconClass = theme === 'dark' ? 'text-purple-400' : 'text-purple-500';
  const helperTextClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`p-6 rounded-xl shadow-md ${cardClass}`}>
      <button
        type="button"
        onClick={toggleAdvancedSettings}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className={`text-lg font-medium flex items-center ${titleClass}`}>
          <FiSettings className={`mr-2 ${iconClass}`} />
          Advanced Settings
        </h3>
        {showAdvanced ? (
          <FiChevronUp className={`h-5 w-5 ${helperTextClass}`} />
        ) : (
          <FiChevronDown className={`h-5 w-5 ${helperTextClass}`} />
        )}
      </button>

      {showAdvanced && (
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor={`transactionLimit-${index}`} className={`block text-sm font-medium mb-1 ${textClass}`}>
              Transaction Limit (KES)
            </label>
            <input
              id={`transactionLimit-${index}`}
              type="number"
              name="transactionLimit"
              value={method.transactionLimit || ''}
              onChange={(e) => handleChange(index, e)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none transition-colors ${inputClass}`}
              placeholder="500000"
              min="0"
              step="1000"
            />
            <p className={`mt-1 text-xs ${helperTextClass}`}>
              Maximum amount per transaction. Set to 0 for no limit.
            </p>
          </div>

          <div className="flex items-center">
            <input
              id={`autoSettle-${index}`}
              name="autoSettle"
              type="checkbox"
              checked={method.autoSettle || false}
              onChange={(e) => handleChange(index, e)}
              className={`h-4 w-4 rounded focus:ring-2 ${
                theme === 'dark' 
                  ? 'text-indigo-500 focus:ring-indigo-500 border-gray-600 bg-gray-700' 
                  : 'text-blue-600 focus:ring-blue-500 border-gray-300'
              }`}
            />
            <label htmlFor={`autoSettle-${index}`} className={`ml-2 block text-sm ${titleClass}`}>
              Auto-settle payments
            </label>
          </div>

          <div className="flex items-center">
            <input
              id={`sandboxMode-${index}`}
              name="sandboxMode"
              type="checkbox"
              checked={method.sandboxMode || false}
              onChange={(e) => handleChange(index, e)}
              className={`h-4 w-4 rounded focus:ring-2 ${
                theme === 'dark' 
                  ? 'text-indigo-500 focus:ring-indigo-500 border-gray-600 bg-gray-700' 
                  : 'text-blue-600 focus:ring-blue-500 border-gray-300'
              }`}
            />
            <label htmlFor={`sandboxMode-${index}`} className={`ml-2 block text-sm ${titleClass}`}>
              Sandbox Mode
            </label>
          </div>

          {method.webhookSecret && (
            <div>
              <label htmlFor={`webhookSecret-${index}`} className={`block text-sm font-medium mb-1 ${textClass}`}>
                Webhook Secret
              </label>
              <div className="relative">
                <input
                  id={`webhookSecret-${index}`}
                  type={showSecrets ? "text" : "password"}
                  name="webhookSecret"
                  value={method.webhookSecret || ''}
                  onChange={(e) => handleChange(index, e)}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none transition-colors pr-20 ${inputClass}`}
                  placeholder="whsec_xxxxxxxxxxxxxx"
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(method.webhookSecret)}
                  className={`absolute inset-y-0 right-10 pr-3 flex items-center transition-colors ${
                    theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Copy to clipboard"
                >
                  <FiCopy />
                </button>
                <button
                  type="button"
                  onClick={toggleSecretVisibility}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors ${
                    theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {showSecrets ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <p className={`mt-1 text-xs ${helperTextClass}`}>
                Used to verify webhook requests. Auto-generated by the system.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSettings;