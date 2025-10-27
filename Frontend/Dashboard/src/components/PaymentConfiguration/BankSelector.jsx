

// import React from 'react';
// import { KENYAN_BANKS } from './Utils/paymentConstants';

// const BankSelector = ({ value, onChange, index }) => (
//   <div>
//     <label htmlFor={`bankName-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
//       Bank Name <span className="text-red-500">*</span>
//     </label>
//     <select
//       id={`bankName-${index}`}
//       name="bankName"
//       value={value || ''}
//       onChange={onChange}
//       className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//     >
//       <option value="">Select Bank</option>
//       {KENYAN_BANKS.map((bank, i) => (
//         <option key={i} value={bank.name}>{bank.name} ({bank.code})</option>
//       ))}
//     </select>
//   </div>
// );

// export default BankSelector;




import React from 'react';
import { KENYAN_BANKS } from './Utils/paymentConstants';

const BankSelector = ({ value, onChange, index, theme = 'light' }) => {
  const inputClass = theme === 'dark'
    ? 'bg-gray-700/50 border-gray-600 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
    : 'bg-white border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

  const labelClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';

  return (
    <div>
      <label htmlFor={`bankName-${index}`} className={`block text-sm font-medium mb-1 ${labelClass}`}>
        Bank Name <span className="text-red-500">*</span>
      </label>
      <select
        id={`bankName-${index}`}
        name="bankName"
        value={value || ''}
        onChange={onChange}
        className={`block w-full pl-3 pr-10 py-2 border rounded-md shadow-sm focus:outline-none transition-colors ${inputClass}`}
      >
        <option value="">Select Bank</option>
        {KENYAN_BANKS.map((bank, i) => (
          <option key={i} value={bank.name}>{bank.name} ({bank.code})</option>
        ))}
      </select>
    </div>
  );
};

export default BankSelector;