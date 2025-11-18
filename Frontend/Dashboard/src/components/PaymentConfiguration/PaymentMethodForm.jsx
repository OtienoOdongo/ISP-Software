// // src/components/PaymentConfiguration/PaymentMethodForm.jsx
// import React from 'react';
// import { FiSave, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
// import PaymentMethodTabs from './PaymentMethodTabs';
// import MethodFields from './MethodFields';

// const PaymentMethodForm = ({
//   config,
//   activeTab,
//   validationErrors,
//   showSecrets,
//   showAdvanced,
//   saving,
//   onTabChange,
//   onAddMethod,
//   onMethodTypeChange,
//   onChange,
//   onRemoveMethod,
//   onToggleSecret,
//   onToggleAdvanced,
//   onGenerateCallback,
//   onCopyToClipboard,
//   onReset,
//   onSubmit,
//   theme
// }) => {
//   const buttonPrimaryClass = theme === 'dark'
//     ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500'
//     : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500';

//   const buttonSecondaryClass = theme === 'dark'
//     ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600 focus:ring-2 focus:ring-gray-500'
//     : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500';

//   return (
//     <form onSubmit={onSubmit}>
//       <PaymentMethodTabs
//         methods={config.paymentMethods}
//         activeTab={activeTab}
//         onChangeTab={onTabChange}
//         onAddMethod={onAddMethod}
//         theme={theme}
//       />

//       {config.paymentMethods.map((method, index) => (
//         <div key={index} className={activeTab === index ? 'block' : 'hidden'}>
//           <div className={`rounded-xl p-6 mb-8 mx-6 shadow-inner ${
//             theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'
//           }`}>
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//               <div className="flex-1">
//                 <label className={`block text-sm font-medium mb-1 ${
//                   theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
//                 }`}>
//                   Payment Method Type <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   value={method.type}
//                   onChange={(e) => onMethodTypeChange(index, e.target.value)}
//                   className={`block w-full pl-3 pr-10 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${
//                     theme === 'dark' 
//                       ? 'bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500' 
//                       : 'bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
//                   }`}
//                 >
//                   {Object.values(PAYMENT_METHODS).map((option, i) => (
//                     <option key={i} value={option.value}>{option.label}</option>
//                   ))}
//                 </select>
//                 {validationErrors[`${index}-type`] && (
//                   <p className="text-red-500 text-xs mt-1">{validationErrors[`${index}-type`]}</p>
//                 )}
//               </div>
              
//               <div className="flex items-center space-x-4">
//                 <div className="flex items-center">
//                   <input
//                     id={`isActive-${index}`}
//                     name="isActive"
//                     type="checkbox"
//                     checked={method.isActive || false}
//                     onChange={(e) => onChange(index, e)}
//                     className={`h-4 w-4 rounded focus:ring-2 ${
//                       theme === 'dark' 
//                         ? 'text-indigo-500 focus:ring-indigo-500 border-gray-600 bg-gray-700' 
//                         : 'text-blue-600 focus:ring-blue-500 border-gray-300'
//                     }`}
//                   />
//                   <label htmlFor={`isActive-${index}`} className={`ml-2 block text-sm ${
//                     theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
//                   }`}>
//                     Enable
//                   </label>
//                 </div>
                
//                 <button
//                   type="button"
//                   onClick={() => onRemoveMethod(index)}
//                   className={`inline-flex items-center px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors ${
//                     theme === 'dark'
//                       ? 'bg-red-900/50 text-red-200 hover:bg-red-800 focus:ring-red-500'
//                       : 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500'
//                   }`}
//                 >
//                   <FiTrash2 className="mr-1" /> Remove
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="px-6 pb-6">
//             <MethodFields
//               method={method}
//               index={index}
//               validationErrors={validationErrors}
//               showSecrets={showSecrets[index]}
//               showAdvanced={showAdvanced[index]}
//               onChange={onChange}
//               onToggleSecret={() => onToggleSecret(index)}
//               onToggleAdvanced={() => onToggleAdvanced(index)}
//               onGenerateCallback={() => onGenerateCallback(index)}
//               onCopyToClipboard={onCopyToClipboard}
//               theme={theme}
//             />
//           </div>

//           <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4 px-8 pb-6">
//             <button
//               type="button"
//               onClick={onReset}
//               disabled={saving}
//               className={`px-6 py-3 border rounded-lg text-base font-medium focus:outline-none focus:ring-2 transition-colors ${buttonSecondaryClass} ${
//                 saving ? 'opacity-50 cursor-not-allowed' : ''
//               }`}
//             >
//               <FiRefreshCw className="inline mr-2" />
//               Reset
//             </button>
//             <button
//               type="submit"
//               disabled={saving}
//               className={`px-6 py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors flex items-center ${buttonPrimaryClass} ${
//                 saving ? 'opacity-50 cursor-not-allowed' : ''
//               }`}
//             >
//               {saving ? (
//                 <>
//                   <div className={`animate-spin rounded-full h-4 w-4 border-b-2 ${
//                     theme === 'dark' ? 'border-white' : 'border-white'
//                   } mr-2`}></div>
//                   Saving...
//                 </>
//               ) : (
//                 <>
//                   <FiSave className="inline mr-2" />
//                   Save Changes
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       ))}
//     </form>
//   );
// };

// export default PaymentMethodForm;










// src/components/PaymentConfiguration/PaymentMethodForm.jsx
import React from 'react';
import { FiSave, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import PaymentMethodTabs from './PaymentMethodTabs';
import MethodFields from './MethodFields';
import { PAYMENT_METHODS } from './Utils/paymentConstants';

const PaymentMethodForm = ({
  config,
  activeTab,
  validationErrors,
  showSecrets,
  showAdvanced,
  saving,
  onTabChange,
  onAddMethod,
  onMethodTypeChange,
  onChange,
  onRemoveMethod,
  onToggleSecret,
  onToggleAdvanced,
  onGenerateCallback,
  onCopyToClipboard,
  onReset,
  onSubmit,
  theme = 'light'
}) => {
  // Theme-based CSS classes
  const buttonPrimaryClass = theme === 'dark'
    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-lg'
    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-md';

  const buttonSecondaryClass = theme === 'dark'
    ? 'bg-gray-700 text-gray-200 border-gray-600 hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 shadow-sm'
    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 shadow-sm';

  const sectionClass = theme === 'dark'
    ? 'bg-gray-700/30 border border-gray-600'
    : 'bg-gray-50 border border-gray-200';

  const titleClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const labelClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';

  const selectClass = theme === 'dark'
    ? 'bg-gray-700 border-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
    : 'bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

  const checkboxClass = theme === 'dark'
    ? 'text-indigo-500 focus:ring-indigo-500 border-gray-600 bg-gray-700'
    : 'text-blue-600 focus:ring-blue-500 border-gray-300';

  return (
    <form onSubmit={onSubmit} className="transition-all duration-300">
      <PaymentMethodTabs
        methods={config.paymentMethods}
        activeTab={activeTab}
        onChangeTab={onTabChange}
        onAddMethod={onAddMethod}
        theme={theme}
      />

      {config.paymentMethods.map((method, index) => (
        <div key={index} className={activeTab === index ? 'block animate-fadeIn' : 'hidden'}>
          {/* Method Header Section */}
          <div className={`rounded-xl p-6 mb-8 mx-6 shadow-inner transition-colors duration-300 ${sectionClass}`}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <label className={`block text-sm font-medium mb-1 ${labelClass}`}>
                  Payment Method Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={method.type}
                  onChange={(e) => onMethodTypeChange(index, e.target.value)}
                  className={`block w-full pl-3 pr-10 py-2.5 border rounded-lg shadow-sm focus:outline-none transition-colors ${selectClass}`}
                >
                  {Object.values(PAYMENT_METHODS).map((option, i) => (
                    <option key={i} value={option.value}>{option.label}</option>
                  ))}
                </select>
                {validationErrors[`${index}-type`] && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors[`${index}-type`]}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    id={`isActive-${index}`}
                    name="isActive"
                    type="checkbox"
                    checked={method.isActive || false}
                    onChange={(e) => onChange(index, e)}
                    className={`h-4 w-4 rounded focus:ring-2 transition-colors ${checkboxClass}`}
                  />
                  <label htmlFor={`isActive-${index}`} className={`ml-2 block text-sm ${titleClass}`}>
                    Enable
                  </label>
                </div>
                
                <button
                  type="button"
                  onClick={() => onRemoveMethod(index)}
                  disabled={config.paymentMethods.length <= 1}
                  className={`inline-flex items-center px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                    theme === 'dark'
                      ? 'bg-red-900/50 text-red-200 hover:bg-red-800 focus:ring-red-500 disabled:bg-red-900/30 disabled:text-red-400'
                      : 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500 disabled:bg-red-50 disabled:text-red-400'
                  } ${config.paymentMethods.length <= 1 ? 'cursor-not-allowed' : ''}`}
                >
                  <FiTrash2 className="mr-1" /> Remove
                </button>
              </div>
            </div>
          </div>

          {/* Method Fields Section */}
          <div className="px-6 pb-6">
            <MethodFields
              method={method}
              index={index}
              validationErrors={validationErrors}
              showSecrets={showSecrets[index]}
              showAdvanced={showAdvanced[index]}
              onChange={onChange}
              onToggleSecret={() => onToggleSecret(index)}
              onToggleAdvanced={() => onToggleAdvanced(index)}
              onGenerateCallback={() => onGenerateCallback(index)}
              onCopyToClipboard={onCopyToClipboard}
              theme={theme}
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-4 px-8 pb-6">
            <button
              type="button"
              onClick={onReset}
              disabled={saving}
              className={`px-6 py-3 border rounded-lg text-base font-medium focus:outline-none focus:ring-2 transition-all duration-200 ${buttonSecondaryClass} ${
                saving ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
              }`}
            >
              <FiRefreshCw className="inline mr-2" />
              Reset
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 flex items-center ${buttonPrimaryClass} ${
                saving ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transform hover:scale-[1.02]'
              }`}
            >
              {saving ? (
                <>
                  <div className={`animate-spin rounded-full h-4 w-4 border-b-2 ${
                    theme === 'dark' ? 'border-white' : 'border-white'
                  } mr-2`}></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiSave className="inline mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      ))}
    </form>
  );
};

export default PaymentMethodForm;