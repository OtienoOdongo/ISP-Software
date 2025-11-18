





// // src/components/PaymentConfiguration/BankSelector.jsx
// import React from 'react';
// import { KENYAN_BANKS } from './Utils/paymentConstants';

// const BankSelector = ({ value, onChange, index, theme = 'light' }) => {
//   const inputClass = theme === 'dark'
//     ? 'bg-gray-700/50 border-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
//     : 'bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

//   const labelClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';

//   return (
//     <div>
//       <label htmlFor={`bankName-${index}`} className={`block text-sm font-medium mb-1 ${labelClass}`}>
//         Bank Name <span className="text-red-500">*</span>
//       </label>
//       <select
//         id={`bankName-${index}`}
//         name="bankName"
//         value={value || ''}
//         onChange={onChange}
//         className={`block w-full pl-3 pr-10 py-2 border rounded-md shadow-sm focus:outline-none transition-colors ${inputClass}`}
//       >
//         <option value="">Select Bank</option>
//         {KENYAN_BANKS.map((bank, i) => (
//           <option key={i} value={bank.name}>{bank.name} ({bank.code})</option>
//         ))}
//       </select>
//     </div>
//   );
// };

// export default BankSelector;











// // src/components/PaymentConfiguration/BankSelector.jsx
// import React from 'react';
// import { KENYAN_BANKS } from './Utils/paymentConstants';
// import { EnhancedSelect, getThemeClasses } from '../ServiceManagement/Shared/components'

// const BankSelector = ({ value, onChange, index, theme = 'light' }) => {
//   const themeClasses = getThemeClasses(theme);

//   // Enhanced bank options with additional metadata
//   const bankOptions = KENYAN_BANKS.map(bank => ({
//     value: bank.name,
//     label: bank.name,
//     code: bank.code,
//     display: `${bank.name} (${bank.code})`
//   }));

//   const handleBankChange = (selectedValue) => {
//     // Find the selected bank to get the full data
//     const selectedBank = KENYAN_BANKS.find(bank => bank.name === selectedValue);
    
//     // Create a comprehensive synthetic event
//     const syntheticEvent = {
//       target: {
//         name: 'bankName',
//         value: selectedValue,
//         // Include additional data if needed
//         dataset: {
//           bankCode: selectedBank?.code || ''
//         }
//       }
//     };
//     onChange(syntheticEvent);
//   };

//   // Custom option renderer for EnhancedSelect (optional)
//   const renderOption = (option, isSelected) => (
//     <div className="flex flex-col">
//       <span className="font-medium text-sm">{option.label}</span>
//       <span className={`text-xs ${isSelected ? 'text-indigo-200' : themeClasses.text.tertiary}`}>
//         Code: {option.code}
//       </span>
//     </div>
//   );

//   return (
//     <div className="space-y-2">
//       <label className={`block text-sm font-medium ${themeClasses.text.secondary}`}>
//         Bank Name <span className="text-red-500">*</span>
//       </label>
      
//       <EnhancedSelect
//         value={value || ''}
//         onChange={handleBankChange}
//         options={bankOptions}
//         placeholder="Select your bank"
//         className="w-full"
//         theme={theme}
//         // Optional: Pass custom renderer
//         // renderOption={renderOption}
//       />
      
//       {/* Optional: Show selected bank code */}
//       {value && (
//         <div className={`text-xs ${themeClasses.text.tertiary} mt-1`}>
//           Selected: {KENYAN_BANKS.find(bank => bank.name === value)?.code || 'N/A'}
//         </div>
//       )}
//     </div>
//   );
// };

// export default BankSelector;





// src/components/PaymentConfiguration/BankSelector.jsx
import React from 'react';
import { KENYAN_BANKS } from './Utils/paymentConstants';
import { EnhancedSelect, getThemeClasses } from '../ServiceManagement/Shared/components'

const BankSelector = ({ value, onChange, index, theme = 'light' }) => {
  const themeClasses = getThemeClasses(theme);

  // Enhanced bank options with additional metadata
  const bankOptions = KENYAN_BANKS.map(bank => ({
    value: bank.name,
    label: bank.name,
    code: bank.code,
    display: `${bank.name} (${bank.code})`
  }));

  const handleBankChange = (selectedValue) => {
    // Find the selected bank to get the full data
    const selectedBank = KENYAN_BANKS.find(bank => bank.name === selectedValue);
    
    // Create a comprehensive synthetic event
    const syntheticEvent = {
      target: {
        name: 'bankName',
        value: selectedValue,
        // Include additional data if needed
        dataset: {
          bankCode: selectedBank?.code || ''
        }
      }
    };
    onChange(syntheticEvent);
  };

  return (
    <div className="space-y-2">
      <label className={`block text-sm font-medium ${themeClasses.text.secondary}`}>
        Bank Name <span className="text-red-500">*</span>
      </label>
      
      <EnhancedSelect
        value={value || ''}
        onChange={handleBankChange}
        options={bankOptions}
        placeholder="Select your bank"
        className="w-full"
        theme={theme}
      />
      
      {/* Optional: Show selected bank code */}
      {value && (
        <div className={`text-xs ${themeClasses.text.tertiary} mt-1`}>
          Bank Code: {KENYAN_BANKS.find(bank => bank.name === value)?.code || 'N/A'}
        </div>
      )}
    </div>
  );
};

export default BankSelector;