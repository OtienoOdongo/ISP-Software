// import React from 'react';
// import { FiPlus } from 'react-icons/fi';
// import { getMethodIcon, getMethodLabel, getMethodColor } from './Utils/paymentUtils';

// const PaymentMethodTabs = ({ 
//   methods, 
//   activeTab, 
//   onChangeTab,
//   onAddMethod 
// }) => {
//   return (
//     <div className="mb-6">
//       <div className="border-b border-gray-200">
//         <nav className="-mb-px flex space-x-8 overflow-x-auto">
//           {methods.map((method, index) => (
//             <button
//               key={index}
//               type="button"
//               onClick={() => onChangeTab(index)}
//               className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
//                 activeTab === index
//                   ? 'border-blue-500 text-blue-600'
//                   : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//               }`}
//             >
//               <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${
//                 getMethodColor(method.type)
//               }`}>
//                 {getMethodIcon(method.type)}
//               </span>
//               {getMethodLabel(method.type)}
//               <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                 method.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
//               }`}>
//                 {method.isActive ? 'Active' : 'Inactive'}
//               </span>
//             </button>
//           ))}
          
//           <button
//             type="button"
//             onClick={onAddMethod}
//             className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center border-transparent text-blue-500 hover:text-blue-700"
//           >
//             <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-600 mr-2">
//               <FiPlus className="h-3 w-3" />
//             </span>
//             Add Method
//           </button>
//         </nav>
//       </div>
//     </div>
//   );
// };

// export default PaymentMethodTabs;








import React from 'react';
import { FiPlus } from 'react-icons/fi';
import { getMethodIcon, getMethodLabel, getMethodColor } from './Utils/paymentUtils';

const PaymentMethodTabs = ({ 
  methods, 
  activeTab, 
  onChangeTab,
  onAddMethod,
  theme = 'light'
}) => {
  const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const activeTabClass = theme === 'dark' 
    ? 'border-indigo-500 text-indigo-400' 
    : 'border-blue-500 text-blue-600';
  const inactiveTabClass = theme === 'dark'
    ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';

  return (
    <div className="mb-6">
      <div className={`border-b ${borderClass}`}>
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {methods.map((method, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onChangeTab(index)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === index ? activeTabClass : inactiveTabClass
              }`}
            >
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${
                getMethodColor(method.type)
              }`}>
                {getMethodIcon(method.type)}
              </span>
              {getMethodLabel(method.type)}
              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                method.isActive 
                  ? theme === 'dark' ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
                  : theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-800'
              }`}>
                {method.isActive ? 'Active' : 'Inactive'}
              </span>
            </button>
          ))}
          
          <button
            type="button"
            onClick={onAddMethod}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center border-transparent ${
              theme === 'dark' ? 'text-indigo-400 hover:text-indigo-300' : 'text-blue-500 hover:text-blue-700'
            }`}
          >
            <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full mr-2 ${
              theme === 'dark' ? 'bg-indigo-900/50 text-indigo-400' : 'bg-blue-100 text-blue-600'
            }`}>
              <FiPlus className="h-3 w-3" />
            </span>
            Add Method
          </button>
        </nav>
      </div>
    </div>
  );
};

export default PaymentMethodTabs;