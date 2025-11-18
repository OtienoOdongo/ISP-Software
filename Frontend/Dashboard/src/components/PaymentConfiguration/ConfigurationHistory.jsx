



// import React from 'react';
// import { FiClock, FiUser, FiCheck, FiAlertCircle } from 'react-icons/fi';
// import { format } from 'date-fns';

// const ConfigurationHistory = ({ history, theme = 'light' }) => {
//   // Theme-based CSS classes
//   const containerClass = theme === 'dark'
//     ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700'
//     : 'bg-white border border-gray-200';

//   const headerClass = theme === 'dark'
//     ? 'bg-gray-700/50 border-gray-600'
//     : 'bg-gray-50 border-gray-200';

//   const titleClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
//   const textClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
//   const dividerClass = theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200';
//   const hoverClass = theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50';
//   const badgeClass = theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';

//   if (!history || history.length === 0) {
//     return (
//       <div className={`p-6 rounded-xl border ${containerClass}`}>
//         <div className={`text-center ${textClass}`}>
//           No configuration history available
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`rounded-xl shadow-md overflow-hidden ${containerClass}`}>
//       <div className={`px-6 py-4 border-b ${headerClass}`}>
//         <h3 className={`text-lg font-semibold flex items-center ${titleClass}`}>
//           <FiClock className={`mr-2 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
//           Configuration History
//         </h3>
//       </div>
      
//       <div className={`divide-y ${dividerClass}`}>
//         {history.map((entry) => (
//           <div key={entry.id} className={`px-6 py-4 transition-colors ${hoverClass}`}>
//             <div className="flex items-start">
//               <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
//                 entry.action.includes('Failed') || entry.action === 'delete' ? 
//                   theme === 'dark' ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-600' :
//                 entry.action.includes('Added') || entry.action === 'create' ? 
//                   theme === 'dark' ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600' :
//                   theme === 'dark' ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'
//               }`}>
//                 {entry.action.includes('Failed') || entry.action === 'delete' ? (
//                   <FiAlertCircle className="h-4 w-4" />
//                 ) : entry.action.includes('Added') || entry.action === 'create' ? (
//                   <FiCheck className="h-4 w-4" />
//                 ) : (
//                   <FiUser className="h-4 w-4" />
//                 )}
//               </div>
              
//               <div className="ml-4 flex-1 min-w-0">
//                 <p className={`text-sm font-medium ${titleClass}`}>
//                   {entry.action_display || entry.action}
//                 </p>
                
//                 <div className="mt-2 flex flex-wrap gap-1">
//                   {Array.isArray(entry.changes) && entry.changes.length > 0 ? (
//                     entry.changes.map((change, i) => (
//                       <span key={i} className={`inline-block rounded-md px-2 py-0.5 text-xs ${badgeClass}`}>
//                         {change}
//                       </span>
//                     ))
//                   ) : (
//                     <span className={`text-sm ${textClass}`}>No changes recorded</span>
//                   )}
//                 </div>
                
//                 <div className={`mt-2 flex items-center text-xs ${textClass}`}>
//                   <FiClock className="mr-1.5" />
//                   <span>{format(new Date(entry.timestamp), 'PPpp')}</span>
//                   <span className="mx-2">•</span>
//                   <FiUser className="mr-1.5" />
//                   <span>{entry.user_username || entry.user || 'System'}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ConfigurationHistory;







// src/components/PaymentConfiguration/ConfigurationHistory.jsx
import React from 'react';
import { FiClock, FiUser, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { format } from 'date-fns';

const ConfigurationHistory = ({ history, theme = 'light' }) => {
  // Theme-based CSS classes
  const containerClass = theme === 'dark'
    ? 'bg-gray-800/80 backdrop-blur-md border border-gray-700'
    : 'bg-white border border-gray-200';

  const headerClass = theme === 'dark'
    ? 'bg-gray-700/50 border-gray-600'
    : 'bg-gray-50 border-gray-200';

  const titleClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const textClass = theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
  const dividerClass = theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200';
  const hoverClass = theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50';
  const badgeClass = theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';

  if (!history || history.length === 0) {
    return (
      <div className={`p-6 rounded-xl border ${containerClass}`}>
        <div className={`text-center ${textClass}`}>
          <FiClock className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No configuration history available</p>
          <p className="text-sm mt-1">Changes will appear here once you modify your payment configuration</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl shadow-md overflow-hidden ${containerClass}`}>
      <div className={`px-6 py-4 border-b ${headerClass}`}>
        <h3 className={`text-lg font-semibold flex items-center ${titleClass}`}>
          <FiClock className={`mr-2 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
          Configuration History
        </h3>
      </div>
      
      <div className={`divide-y ${dividerClass}`}>
        {history.map((entry) => (
          <div key={entry.id} className={`px-6 py-4 transition-colors ${hoverClass}`}>
            <div className="flex items-start">
              <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                entry.action?.includes('Failed') || entry.action === 'delete' ? 
                  theme === 'dark' ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-600' :
                entry.action?.includes('Added') || entry.action === 'create' ? 
                  theme === 'dark' ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600' :
                  theme === 'dark' ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'
              }`}>
                {entry.action?.includes('Failed') || entry.action === 'delete' ? (
                  <FiAlertCircle className="h-4 w-4" />
                ) : entry.action?.includes('Added') || entry.action === 'create' ? (
                  <FiCheck className="h-4 w-4" />
                ) : (
                  <FiUser className="h-4 w-4" />
                )}
              </div>
              
              <div className="ml-4 flex-1 min-w-0">
                <p className={`text-sm font-medium ${titleClass}`}>
                  {entry.action_display || entry.action || 'Configuration updated'}
                </p>
                
                <div className="mt-2 flex flex-wrap gap-1">
                  {Array.isArray(entry.changes) && entry.changes.length > 0 ? (
                    entry.changes.map((change, i) => (
                      <span key={i} className={`inline-block rounded-md px-2 py-0.5 text-xs ${badgeClass}`}>
                        {change}
                      </span>
                    ))
                  ) : (
                    <span className={`text-sm ${textClass}`}>Configuration updated</span>
                  )}
                </div>
                
                <div className={`mt-2 flex items-center text-xs ${textClass}`}>
                  <FiClock className="mr-1.5" />
                  <span>{format(new Date(entry.timestamp || entry.created_at), 'PPpp')}</span>
                  <span className="mx-2">•</span>
                  <FiUser className="mr-1.5" />
                  <span>{entry.user_username || entry.user || 'System'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConfigurationHistory;