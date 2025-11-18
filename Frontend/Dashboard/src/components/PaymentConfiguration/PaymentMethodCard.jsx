

// // src/components/PaymentConfiguration/PaymentMethodCard.jsx
// import React from 'react';
// import { 
//   FiCheckCircle, 
//   FiAlertCircle, 
//   FiEdit2, 
//   FiChevronRight, 
//   FiBarChart2, 
//   FiCopy,
//   FiCode 
// } from 'react-icons/fi';
// import ConfigurationHistory from './ConfigurationHistory';
// import TestConnectionButton from './TestConnectionButton';
// import { getMethodIcon, getMethodLabel, getMethodColor, getMethodMetadata } from './Utils/paymentUtils';

// const PaymentMethodCard = ({
//   savedConfig,
//   activeTab,
//   history,
//   stats,
//   onTabChange,
//   onEditMethod,
//   onCopyToClipboard,
//   theme
// }) => {
//   const cardClass = theme === 'dark'
//     ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700'
//     : 'bg-white border border-gray-200';

//   const titleClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
//   const textClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';

//   // Safe stats access with defaults
//   const safeStats = React.useMemo(() => {
//     if (!stats || typeof stats !== 'object') {
//       return {
//         total_revenue: 0,
//         success_rate: 0,
//         total_transactions: 0,
//         time_range: '30d',
//         access_type: null
//       };
//     }
    
//     return {
//       total_revenue: stats.total_revenue || 0,
//       success_rate: stats.success_rate || 0,
//       total_transactions: stats.total_transactions || 0,
//       time_range: stats.time_range || '30d',
//       access_type: stats.access_type || null
//     };
//   }, [stats]);

//   const renderAnalytics = () => {
//     return (
//       <div className={`p-6 rounded-xl shadow-md mt-8 ${cardClass}`}>
//         <h3 className={`text-lg font-medium mb-4 flex items-center ${titleClass}`}>
//           <FiBarChart2 className={`mr-2 ${theme === 'dark' ? 'text-indigo-400' : 'text-blue-500'}`} />
//           Payment Analytics ({safeStats.time_range})
//         </h3>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className={`p-4 rounded-lg border ${
//             theme === 'dark' ? 'bg-gray-700/50 border-blue-700/50' : 'bg-gray-50 border-blue-100'
//           }`}>
//             <p className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>
//               Total Revenue
//             </p>
//             <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-100' : 'text-blue-800'}`}>
//               KES {safeStats.total_revenue.toLocaleString()}
//             </p>
//           </div>
//           <div className={`p-4 rounded-lg border ${
//             theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-100'
//           }`}>
//             <p className={`text-sm font-medium ${textClass}`}>Success Rate</p>
//             <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
//               {safeStats.success_rate}%
//             </p>
//           </div>
//           <div className={`p-4 rounded-lg border ${
//             theme === 'dark' ? 'bg-gray-700/50 border-green-700/50' : 'bg-gray-50 border-green-100'
//           }`}>
//             <p className={`text-sm font-medium ${theme === 'dark' ? 'text-green-300' : 'text-green-600'}`}>
//               Transactions
//             </p>
//             <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-100' : 'text-green-800'}`}>
//               {safeStats.total_transactions.toLocaleString()}
//             </p>
//           </div>
//         </div>
//         {safeStats.access_type && (
//           <p className={`text-sm mt-3 ${textClass}`}>
//             Access type: <span className="font-medium">{safeStats.access_type}</span>
//           </p>
//         )}
//       </div>
//     );
//   };

//   // Safe config check
//   const hasPaymentMethods = savedConfig && 
//                            savedConfig.paymentMethods && 
//                            Array.isArray(savedConfig.paymentMethods) && 
//                            savedConfig.paymentMethods.length > 0;

//   const lastUpdated = savedConfig?.lastUpdated ? new Date(savedConfig.lastUpdated).toLocaleString() : 'Never';

//   return (
//     <div className="space-y-8 p-8">
//       {!hasPaymentMethods ? (
//         <div className={`text-center py-16 rounded-xl ${
//           theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'
//         }`}>
//           <FiAlertCircle className={`h-12 w-12 mx-auto mb-4 ${
//             theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
//           }`} />
//           <h3 className={`text-lg font-medium mb-2 ${titleClass}`}>
//             No Payment Methods Configured
//           </h3>
//           <p className={`text-sm mb-6 ${textClass}`}>
//             Get started by adding your first payment method from the header above.
//           </p>
//         </div>
//       ) : (
//         <>
//           {/* Success alert */}
//           <div className={`border-l-4 rounded-xl p-6 shadow-sm ${
//             theme === 'dark' ? 'bg-green-900/30 border-green-500' : 'bg-green-50 border-green-500'
//           }`}>
//             <div className="flex items-center">
//               <FiCheckCircle className={`h-6 w-6 ${
//                 theme === 'dark' ? 'text-green-400' : 'text-green-500'
//               }`} />
//               <div className="ml-3">
//                 <p className={theme === 'dark' ? 'text-green-300' : 'text-green-800'}>
//                   Payment configuration is active and up to date!
//                 </p>
//                 <p className={`mt-1 text-sm ${
//                   theme === 'dark' ? 'text-green-400' : 'text-green-700'
//                 }`}>
//                   Last updated: {lastUpdated}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Payment methods overview */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {savedConfig.paymentMethods.map((method, index) => {
//               const methodInfo = getMethodMetadata(method.type);
//               const isActive = method?.isActive ?? false;
//               const sandboxMode = method?.sandboxMode ?? false;
//               const shortCode = method?.shortCode;
//               const callbackURL = method?.callbackURL;
//               const methodId = method?.id;

//               return (
//                 <div 
//                   key={index}
//                   className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
//                     index === activeTab
//                       ? theme === 'dark' 
//                         ? 'border-indigo-500 shadow-md bg-gray-700/50' 
//                         : 'border-blue-500 shadow-md bg-blue-50'
//                       : theme === 'dark'
//                         ? 'border-gray-600 hover:border-gray-500 hover:shadow-sm bg-gray-800/50'
//                         : 'border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white'
//                   }`}
//                   onClick={() => onTabChange(index)}
//                 >
//                   <div className="flex items-start justify-between">
//                     <div className="flex items-start">
//                       <div className={`flex-shrink-0 p-3 rounded-lg ${methodInfo?.color || 'bg-gray-200'} mr-4`}>
//                         {methodInfo?.icon || <FiAlertCircle />}
//                       </div>
//                       <div>
//                         <h3 className={`text-lg font-semibold ${titleClass}`}>
//                           {methodInfo?.label || method.type}
//                         </h3>
//                         <p className={`mt-1 text-sm ${textClass}`}>
//                           {methodInfo?.description || 'Payment method'}
//                         </p>
                        
//                         <div className="mt-3 flex flex-wrap gap-2">
//                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                             isActive 
//                               ? theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
//                               : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
//                           }`}>
//                             {isActive ? 'Active' : 'Inactive'}
//                           </span>
//                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                             sandboxMode 
//                               ? theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
//                               : theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
//                           }`}>
//                             {sandboxMode ? 'Sandbox' : 'Live'}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex-shrink-0 flex flex-col gap-2">
//                       {index === activeTab && (
//                         <div className={theme === 'dark' ? 'text-indigo-400' : 'text-blue-500'}>
//                           <FiChevronRight />
//                         </div>
//                       )}
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           onEditMethod(index);
//                         }}
//                         className={`inline-flex items-center px-3 py-1 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-colors text-sm ${
//                           theme === 'dark'
//                             ? 'bg-indigo-900/50 text-indigo-200 hover:bg-indigo-800 focus:ring-indigo-500'
//                             : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 focus:ring-indigo-500'
//                         }`}
//                       >
//                         <FiEdit2 className="mr-1" /> Edit
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Selected method details */}
//           {savedConfig.paymentMethods.map((method, index) => {
//             const isActive = method?.isActive ?? false;
//             const sandboxMode = method?.sandboxMode ?? false;
//             const shortCode = method?.shortCode;
//             const callbackURL = method?.callbackURL;
//             const methodId = method?.id;

//             return (
//               <div key={index} className={activeTab === index ? 'block' : 'hidden'}>
//                 <div className={`rounded-xl shadow overflow-hidden border ${
//                   theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
//                 }`}>
//                   <div className="p-6">
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                       <div className="space-y-6">
//                         <div className={`p-6 rounded-lg ${
//                           theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
//                         }`}>
//                           <h3 className={`text-lg font-medium flex items-center ${titleClass}`}>
//                             {getMethodIcon(method.type)}
//                             <span className="ml-2">{getMethodLabel(method.type)} Details</span>
//                           </h3>
                          
//                           <dl className="space-y-4 mt-4">
//                             {/* Method-specific details */}
//                             {method.type === 'mpesa_paybill' && shortCode && (
//                               <div className="sm:grid sm:grid-cols-3 sm:gap-4">
//                                 <dt className={`text-sm font-medium ${textClass}`}>Paybill Number</dt>
//                                 <dd className={`mt-1 text-sm sm:mt-0 sm:col-span-2 ${
//                                   theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
//                                 }`}>{shortCode}</dd>
//                               </div>
//                             )}
                            
//                             <div className="sm:grid sm:grid-cols-3 sm:gap-4">
//                               <dt className={`text-sm font-medium ${textClass}`}>Status</dt>
//                               <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
//                                 {isActive ? (
//                                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                                     theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
//                                   }`}>
//                                     Active
//                                   </span>
//                                 ) : (
//                                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                                     theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
//                                   }`}>
//                                     Inactive
//                                   </span>
//                                 )}
//                               </dd>
//                             </div>

//                             <div className="sm:grid sm:grid-cols-3 sm:gap-4">
//                               <dt className={`text-sm font-medium ${textClass}`}>Environment</dt>
//                               <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
//                                 {sandboxMode ? (
//                                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                                     theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
//                                   }`}>
//                                     Sandbox
//                                   </span>
//                                 ) : (
//                                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                                     theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
//                                   }`}>
//                                     Live
//                                   </span>
//                                 )}
//                               </dd>
//                             </div>
//                           </dl>
//                         </div>
                        
//                         <TestConnectionButton 
//                           methodType={method.type} 
//                           gatewayId={methodId}
//                           callbackUrl={callbackURL}
//                           fullWidth
//                           theme={theme}
//                         />
//                       </div>
                      
//                       <div className="space-y-6">
//                         <div className={`p-6 rounded-lg ${
//                           theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
//                         }`}>
//                           <h3 className={`text-lg font-medium mb-4 flex items-center ${titleClass}`}>
//                             <FiCode className="mr-2" />
//                             Integration Details
//                           </h3>
                          
//                           <div className="space-y-4">
//                             {callbackURL && (
//                               <div className="sm:grid sm:grid-cols-3 sm:gap-4">
//                                 <dt className={`text-sm font-medium ${textClass}`}>Callback URL</dt>
//                                 <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2 break-all">
//                                   <div className={`p-3 rounded-md ${
//                                     theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'
//                                   }`}>
//                                     <div className="flex items-center justify-between">
//                                       <span className={`truncate ${
//                                         theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
//                                       }`}>{callbackURL}</span>
//                                       <button 
//                                         onClick={() => onCopyToClipboard(callbackURL)}
//                                         className={`ml-2 flex-shrink-0 transition-colors ${
//                                           theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
//                                         }`}
//                                         title="Copy to clipboard"
//                                       >
//                                         <FiCopy size={14} />
//                                       </button>
//                                     </div>
//                                   </div>
//                                 </dd>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
          
//           {/* Configuration history */}
//           <ConfigurationHistory history={history} theme={theme} />
          
//           {/* Analytics Section */}
//           {renderAnalytics()}
//         </>
//       )}
//     </div>
//   );
// };

// export default PaymentMethodCard;






// src/components/PaymentConfiguration/PaymentMethodCard.jsx
import React from 'react';
import { 
  FiCheckCircle, 
  FiAlertCircle, 
  FiEdit2, 
  FiChevronRight, 
  FiBarChart2, 
  FiCopy,
  FiCode,
  FiZap,
  FiShield
} from 'react-icons/fi';
import ConfigurationHistory from './ConfigurationHistory';
import TestConnectionButton from './TestConnectionButton';
import { getMethodIcon, getMethodLabel, getMethodColor, getMethodMetadata } from './Utils/paymentUtils';

const PaymentMethodCard = ({
  savedConfig,
  activeTab,
  history,
  stats,
  onTabChange,
  onEditMethod,
  onCopyToClipboard,
  theme = 'light'
}) => {
  // Theme-based CSS classes
  const cardClass = theme === 'dark'
    ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700 shadow-xl'
    : 'bg-white border border-gray-200 shadow-lg';

  const sectionClass = theme === 'dark'
    ? 'bg-gray-700/50 border-gray-600'
    : 'bg-gray-50 border-gray-200';

  const titleClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const subtitleClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  // Safe stats access with defaults
  const safeStats = React.useMemo(() => {
    if (!stats || typeof stats !== 'object') {
      return {
        total_revenue: 0,
        success_rate: 0,
        total_transactions: 0,
        time_range: '30d',
        access_type: null
      };
    }
    
    return {
      total_revenue: stats.total_revenue || 0,
      success_rate: stats.success_rate || 0,
      total_transactions: stats.total_transactions || 0,
      time_range: stats.time_range || '30d',
      access_type: stats.access_type || null
    };
  }, [stats]);

  const renderAnalytics = () => {
    if (safeStats.total_transactions === 0) {
      return (
        <div className={`p-6 rounded-xl shadow-md mt-8 ${cardClass} transition-colors duration-300`}>
          <h3 className={`text-lg font-medium mb-4 flex items-center ${titleClass}`}>
            <FiBarChart2 className={`mr-2 ${theme === 'dark' ? 'text-indigo-400' : 'text-blue-500'}`} />
            Payment Analytics
          </h3>
          <div className="text-center py-8">
            <FiBarChart2 className={`h-12 w-12 mx-auto mb-3 ${subtitleClass}`} />
            <p className={subtitleClass}>No transaction data available yet</p>
            <p className={`text-sm mt-1 ${subtitleClass}`}>
              Analytics will appear here once payments start processing
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className={`p-6 rounded-xl shadow-md mt-8 ${cardClass} transition-colors duration-300`}>
        <h3 className={`text-lg font-medium mb-4 flex items-center ${titleClass}`}>
          <FiBarChart2 className={`mr-2 ${theme === 'dark' ? 'text-indigo-400' : 'text-blue-500'}`} />
          Payment Analytics ({safeStats.time_range})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border transition-colors duration-300 ${
            theme === 'dark' ? 'bg-gray-700/50 border-blue-700/50' : 'bg-gray-50 border-blue-100'
          }`}>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>
              Total Revenue
            </p>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-100' : 'text-blue-800'}`}>
              KES {safeStats.total_revenue.toLocaleString()}
            </p>
          </div>
          <div className={`p-4 rounded-lg border transition-colors duration-300 ${
            theme === 'dark' ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-100'
          }`}>
            <p className={`text-sm font-medium ${textClass}`}>Success Rate</p>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
              {safeStats.success_rate}%
            </p>
          </div>
          <div className={`p-4 rounded-lg border transition-colors duration-300 ${
            theme === 'dark' ? 'bg-gray-700/50 border-green-700/50' : 'bg-gray-50 border-green-100'
          }`}>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-green-300' : 'text-green-600'}`}>
              Transactions
            </p>
            <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-100' : 'text-green-800'}`}>
              {safeStats.total_transactions.toLocaleString()}
            </p>
          </div>
        </div>
        {safeStats.access_type && (
          <p className={`text-sm mt-3 ${textClass}`}>
            Access type: <span className="font-medium">{safeStats.access_type}</span>
          </p>
        )}
      </div>
    );
  };

  // Safe config check
  const hasPaymentMethods = savedConfig && 
                           savedConfig.paymentMethods && 
                           Array.isArray(savedConfig.paymentMethods) && 
                           savedConfig.paymentMethods.length > 0;

  const lastUpdated = savedConfig?.lastUpdated ? new Date(savedConfig.lastUpdated).toLocaleString() : 'Never';

  // Calculate active methods count
  const activeMethodsCount = savedConfig?.paymentMethods?.filter(m => m.isActive)?.length || 0;

  if (!hasPaymentMethods) {
    return (
      <div className="space-y-8 p-8">
        <div className={`text-center py-16 rounded-xl transition-colors duration-300 ${
          theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50'
        }`}>
          <FiAlertCircle className={`h-16 w-16 mx-auto mb-4 ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`} />
          <h3 className={`text-xl font-medium mb-3 ${titleClass}`}>
            No Payment Methods Configured
          </h3>
          <p className={`text-lg mb-6 ${subtitleClass}`}>
            Get started by adding your first payment method
          </p>
          <div className={`inline-flex items-center px-4 py-2 rounded-lg ${
            theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
          }`}>
            <FiZap className="mr-2" />
            <span>Click "Add Payment Method" above to begin</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Success Alert */}
      <div className={`border-l-4 rounded-xl p-6 shadow-sm transition-colors duration-300 ${
        theme === 'dark' ? 'bg-green-900/30 border-green-500' : 'bg-green-50 border-green-500'
      }`}>
        <div className="flex items-center">
          <FiCheckCircle className={`h-6 w-6 ${
            theme === 'dark' ? 'text-green-400' : 'text-green-500'
          }`} />
          <div className="ml-3">
            <p className={theme === 'dark' ? 'text-green-300' : 'text-green-800'}>
              Payment configuration is active and up to date!
            </p>
            <p className={`mt-1 text-sm ${
              theme === 'dark' ? 'text-green-400' : 'text-green-700'
            }`}>
              Last updated: {lastUpdated}
            </p>
            <div className="flex flex-wrap gap-4 mt-2">
              <span className={`inline-flex items-center text-sm ${
                theme === 'dark' ? 'text-green-300' : 'text-green-700'
              }`}>
                <FiZap className="mr-1" />
                {activeMethodsCount} active method{activeMethodsCount !== 1 ? 's' : ''}
              </span>
              <span className={`inline-flex items-center text-sm ${
                theme === 'dark' ? 'text-green-300' : 'text-green-700'
              }`}>
                <FiShield className="mr-1" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedConfig.paymentMethods.map((method, index) => {
          const methodInfo = getMethodMetadata(method.type);
          const isActive = method?.isActive ?? false;
          const sandboxMode = method?.sandboxMode ?? false;
          const shortCode = method?.shortCode;
          const callbackURL = method?.callbackURL;
          const methodId = method?.id;

          return (
            <div 
              key={index}
              className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                index === activeTab
                  ? theme === 'dark' 
                    ? 'border-indigo-500 shadow-lg bg-gray-700/50' 
                    : 'border-blue-500 shadow-lg bg-blue-50'
                  : theme === 'dark'
                    ? 'border-gray-600 hover:border-gray-500 hover:shadow-md bg-gray-800/50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
              }`}
              onClick={() => onTabChange(index)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className={`flex-shrink-0 p-3 rounded-lg ${methodInfo?.color || 'bg-gray-200'} mr-4`}>
                    {methodInfo?.icon || <FiAlertCircle />}
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${titleClass}`}>
                      {methodInfo?.label || method.type}
                    </h3>
                    <p className={`mt-1 text-sm ${textClass}`}>
                      {methodInfo?.description || 'Payment method'}
                    </p>
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        isActive 
                          ? theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                          : theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        sandboxMode 
                          ? theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                          : theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {sandboxMode ? 'Sandbox' : 'Live'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 flex flex-col gap-2">
                  {index === activeTab && (
                    <div className={theme === 'dark' ? 'text-indigo-400' : 'text-blue-500'}>
                      <FiChevronRight />
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditMethod(index);
                    }}
                    className={`inline-flex items-center px-3 py-1 rounded-lg shadow-sm focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                      theme === 'dark'
                        ? 'bg-indigo-900/50 text-indigo-200 hover:bg-indigo-800 focus:ring-indigo-500 hover:shadow-md'
                        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200 focus:ring-indigo-500 hover:shadow-md'
                    }`}
                  >
                    <FiEdit2 className="mr-1" /> Edit
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Method Details */}
      {savedConfig.paymentMethods.map((method, index) => {
        const isActive = method?.isActive ?? false;
        const sandboxMode = method?.sandboxMode ?? false;
        const shortCode = method?.shortCode;
        const callbackURL = method?.callbackURL;
        const methodId = method?.id;

        return (
          <div key={index} className={activeTab === index ? 'block animate-fadeIn' : 'hidden'}>
            <div className={`rounded-xl shadow overflow-hidden border transition-colors duration-300 ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className={`p-6 rounded-lg transition-colors duration-300 ${sectionClass}`}>
                      <h3 className={`text-lg font-medium flex items-center ${titleClass}`}>
                        {getMethodIcon(method.type)}
                        <span className="ml-2">{getMethodLabel(method.type)} Details</span>
                      </h3>
                      
                      <dl className="space-y-4 mt-4">
                        {/* Method-specific details */}
                        {method.type === 'mpesa_paybill' && shortCode && (
                          <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                            <dt className={`text-sm font-medium ${textClass}`}>Paybill Number</dt>
                            <dd className={`mt-1 text-sm sm:mt-0 sm:col-span-2 ${
                              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                            }`}>{shortCode}</dd>
                          </div>
                        )}
                        
                        {method.type === 'mpesa_till' && shortCode && (
                          <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                            <dt className={`text-sm font-medium ${textClass}`}>Till Number</dt>
                            <dd className={`mt-1 text-sm sm:mt-0 sm:col-span-2 ${
                              theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                            }`}>{shortCode}</dd>
                          </div>
                        )}
                        
                        <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                          <dt className={`text-sm font-medium ${textClass}`}>Status</dt>
                          <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                            {isActive ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'
                              }`}>
                                Active
                              </span>
                            ) : (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
                              }`}>
                                Inactive
                              </span>
                            )}
                          </dd>
                        </div>

                        <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                          <dt className={`text-sm font-medium ${textClass}`}>Environment</dt>
                          <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                            {sandboxMode ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                theme === 'dark' ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                Sandbox
                              </span>
                            ) : (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                              }`}>
                                Live
                              </span>
                            )}
                          </dd>
                        </div>
                      </dl>
                    </div>
                    
                    <TestConnectionButton 
                      methodType={method.type} 
                      gatewayId={methodId}
                      callbackUrl={callbackURL}
                      fullWidth
                      theme={theme}
                    />
                  </div>
                  
                  <div className="space-y-6">
                    <div className={`p-6 rounded-lg transition-colors duration-300 ${sectionClass}`}>
                      <h3 className={`text-lg font-medium mb-4 flex items-center ${titleClass}`}>
                        <FiCode className="mr-2" />
                        Integration Details
                      </h3>
                      
                      <div className="space-y-4">
                        {callbackURL && (
                          <div className="sm:grid sm:grid-cols-3 sm:gap-4">
                            <dt className={`text-sm font-medium ${textClass}`}>Callback URL</dt>
                            <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2 break-all">
                              <div className={`p-3 rounded-md transition-colors duration-300 ${
                                theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <span className={`truncate ${
                                    theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                                  }`}>{callbackURL}</span>
                                  <button 
                                    onClick={() => onCopyToClipboard(callbackURL)}
                                    className={`ml-2 flex-shrink-0 transition-colors ${
                                      theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                    title="Copy to clipboard"
                                  >
                                    <FiCopy size={14} />
                                  </button>
                                </div>
                              </div>
                            </dd>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      
      {/* Configuration History */}
      <ConfigurationHistory history={history} theme={theme} />
      
      {/* Analytics Section */}
      {renderAnalytics()}
    </div>
  );
};

export default PaymentMethodCard;