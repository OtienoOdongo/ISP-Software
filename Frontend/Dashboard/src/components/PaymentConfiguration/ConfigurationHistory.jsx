






// import React from 'react';
// import { FiClock, FiUser, FiCheck, FiAlertCircle } from 'react-icons/fi';
// import { format } from 'date-fns';

// const ConfigurationHistory = ({ history }) => {
//   if (!history || history.length === 0) {
//     return (
//       <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
//         <div className="text-center text-gray-500">
//           No configuration history available
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//       <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
//         <h3 className="text-lg font-semibold text-gray-900 flex items-center">
//           <FiClock className="mr-2 text-indigo-600" />
//           Configuration History
//         </h3>
//       </div>
      
//       <div className="divide-y divide-gray-200">
//         {history.map((entry) => (
//           <div key={entry.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
//             <div className="flex items-start">
//               <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
//                 entry.action.includes('Failed') ? 'bg-red-100 text-red-600' :
//                 entry.action.includes('Added') ? 'bg-green-100 text-green-600' :
//                 'bg-blue-100 text-blue-600'
//               }`}>
//                 {entry.action.includes('Failed') ? (
//                   <FiAlertCircle className="h-4 w-4" />
//                 ) : entry.action.includes('Added') ? (
//                   <FiCheck className="h-4 w-4" />
//                 ) : (
//                   <FiUser className="h-4 w-4" />
//                 )}
//               </div>
              
//               <div className="ml-4 flex-1 min-w-0">
//                 <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                
//                 <div className="mt-2 flex flex-wrap gap-1">
//                   {Array.isArray(entry.changes) ? (
//                     entry.changes.map((change, i) => (
//                       <span key={i} className="inline-block bg-gray-100 rounded-md px-2 py-0.5 text-xs text-gray-700">
//                         {change}
//                       </span>
//                     ))
//                   ) : (
//                     <span className="text-sm text-gray-500">{entry.changes || 'No changes recorded'}</span>
//                   )}
//                 </div>
                
//                 <div className="mt-2 flex items-center text-xs text-gray-500">
//                   <FiClock className="mr-1.5" />
//                   <span>{format(new Date(entry.timestamp), 'PPpp')}</span>
//                   <span className="mx-2">•</span>
//                   <FiUser className="mr-1.5" />
//                   <span>{entry.user || 'System'}</span>
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








import React from 'react';
import { FiClock, FiUser, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { format } from 'date-fns';

const ConfigurationHistory = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <div className="text-center text-gray-500">
          No configuration history available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FiClock className="mr-2 text-indigo-600" />
          Configuration History
        </h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {history.map((entry) => (
          <div key={entry.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start">
              <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                entry.action.includes('Failed') || entry.action === 'delete' ? 'bg-red-100 text-red-600' :
                entry.action.includes('Added') || entry.action === 'create' ? 'bg-green-100 text-green-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {entry.action.includes('Failed') || entry.action === 'delete' ? (
                  <FiAlertCircle className="h-4 w-4" />
                ) : entry.action.includes('Added') || entry.action === 'create' ? (
                  <FiCheck className="h-4 w-4" />
                ) : (
                  <FiUser className="h-4 w-4" />
                )}
              </div>
              
              <div className="ml-4 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {entry.action_display || entry.action}
                </p>
                
                <div className="mt-2 flex flex-wrap gap-1">
                  {Array.isArray(entry.changes) && entry.changes.length > 0 ? (
                    entry.changes.map((change, i) => (
                      <span key={i} className="inline-block bg-gray-100 rounded-md px-2 py-0.5 text-xs text-gray-700">
                        {change}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No changes recorded</span>
                  )}
                </div>
                
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <FiClock className="mr-1.5" />
                  <span>{format(new Date(entry.timestamp), 'PPpp')}</span>
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