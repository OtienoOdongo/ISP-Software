// import React from 'react';
// import { FaHistory, FaUser, FaClock, FaInfoCircle } from 'react-icons/fa';
// import { format } from 'date-fns';

// const ConfigurationHistory = ({ history }) => {
//   if (!history || history.length === 0) {
//     return (
//       <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-8">
//         <div className="flex items-center justify-center text-gray-500">
//           <FaInfoCircle className="mr-2" />
//           <span>No configuration history available</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-xl shadow overflow-hidden mt-8">
//       <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center">
//         <FaHistory className="text-gray-500 mr-2" />
//         <h3 className="text-lg font-medium text-gray-900">Configuration History</h3>
//       </div>
//       <div className="divide-y divide-gray-200">
//         {history.map((entry) => (
//           <div key={entry.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
//             <div className="flex items-start">
//               <div className="flex-shrink-0 mt-1">
//                 <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
//                   <FaUser className="h-4 w-4" />
//                 </div>
//               </div>
//               <div className="ml-3 flex-1 min-w-0">
//                 <p className="text-sm font-medium text-gray-900">{entry.action}</p>
//                 <p className="text-sm text-gray-500">
//                   {Array.isArray(entry.changes) 
//                     ? entry.changes.join(', ') 
//                     : entry.changes}
//                 </p>
//                 <div className="mt-1 flex items-center text-xs text-gray-500">
//                   <FaClock className="mr-1" />
//                   <span>{format(new Date(entry.timestamp), 'PPpp')}</span>
//                   <span className="mx-1">•</span>
//                   <span>{entry.user}</span>
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





// import React from 'react';
// import { FiClock, FiUser, FiInfo } from 'react-icons/fi';
// import { format } from 'date-fns';

// const ConfigurationHistory = ({ history }) => {
//   if (!history || history.length === 0) {
//     return (
//       <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-8">
//         <div className="flex items-center justify-center text-gray-500">
//           <FiInfo className="mr-2" />
//           <span>No configuration history available</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-xl shadow overflow-hidden mt-8">
//       <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center">
//         <FiClock className="text-gray-500 mr-2" />
//         <h3 className="text-lg font-medium text-gray-900">Configuration History</h3>
//       </div>
//       <div className="divide-y divide-gray-200">
//         {history.map((entry) => (
//           <div key={entry.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
//             <div className="flex items-start">
//               <div className="flex-shrink-0 mt-1">
//                 <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
//                   <FiUser className="h-4 w-4" />
//                 </div>
//               </div>
//               <div className="ml-3 flex-1 min-w-0">
//                 <p className="text-sm font-medium text-gray-900">{entry.action}</p>
//                 <p className="text-sm text-gray-500">
//                   {Array.isArray(entry.changes) 
//                     ? entry.changes.join(', ') 
//                     : entry.changes}
//                 </p>
//                 <div className="mt-1 flex items-center text-xs text-gray-500">
//                   <FiClock className="mr-1" />
//                   <span>{format(new Date(entry.timestamp), 'PPpp')}</span>
//                   <span className="mx-1">•</span>
//                   <span>{entry.user}</span>
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






// import React from 'react';
// import { FiClock, FiUser, FiInfo, FiCheck, FiAlertCircle } from 'react-icons/fi';
// import { format } from 'date-fns';

// export const ConfigurationHistory = ({ history }) => {
//   if (!history || history.length === 0) {
//     return (
//       <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-8">
//         <div className="flex items-center justify-center text-gray-500">
//           <FiInfo className="mr-2" />
//           <span>No configuration history available</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-xl shadow overflow-hidden mt-8 border border-gray-200">
//       <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
//         <h3 className="text-lg font-semibold text-gray-900 flex items-center">
//           <FiClock className="mr-2 text-indigo-500" />
//           Configuration History
//         </h3>
//       </div>
//       <div className="divide-y divide-gray-200">
//         {history.map((entry) => (
//           <div key={entry.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
//             <div className="flex items-start">
//               <div className="flex-shrink-0 mt-1">
//                 <div className={`flex items-center justify-center h-8 w-8 rounded-full ${
//                   entry.action.includes('Added') 
//                     ? 'bg-green-100 text-green-600' 
//                     : entry.action.includes('Failed') 
//                       ? 'bg-red-100 text-red-600'
//                       : 'bg-blue-100 text-blue-600'
//                 }`}>
//                   {entry.action.includes('Added') ? (
//                     <FiCheck className="h-4 w-4" />
//                   ) : entry.action.includes('Failed') ? (
//                     <FiAlertCircle className="h-4 w-4" />
//                   ) : (
//                     <FiUser className="h-4 w-4" />
//                   )}
//                 </div>
//               </div>
//               <div className="ml-3 flex-1 min-w-0">
//                 <p className="text-sm font-medium text-gray-900">{entry.action}</p>
//                 <p className="text-sm text-gray-500 mt-1">
//                   {Array.isArray(entry.changes) 
//                     ? entry.changes.map((change, i) => (
//                         <span key={i} className="inline-block bg-gray-100 rounded px-2 py-0.5 text-xs text-gray-700 mr-1 mb-1">
//                           {change}
//                         </span>
//                       ))
//                     : entry.changes}
//                 </p>
//                 <div className="mt-2 flex items-center text-xs text-gray-500">
//                   <FiClock className="mr-1.5" />
//                   <span>{format(new Date(entry.timestamp), 'PPpp')}</span>
//                   <span className="mx-2 text-gray-300">•</span>
//                   <span className="text-indigo-600">{entry.user}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };



import React from 'react';
import { FiClock, FiInfo, FiCheck, FiUser, FiAlertCircle } from 'react-icons/fi';
import { format } from 'date-fns';
import PropTypes from 'prop-types';

/**
 * Displays the history of payment configuration changes.
 */
const ConfigurationHistory = ({ history, actions, statuses }) => {
  if (!history || history.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-md border border-gray-200 mt-6">
        <div className="flex items-center justify-center text-gray-500">
          <FiInfo className="mr-2" />
          <span>No configuration history available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden mt-6 border-gray-200">
      <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <FiClock className="mr-2 text-indigo-600" />
          <span className="font-semibold">Configuration History</span>
        </h3>
      </div>
      <div className="divide-y divide-gray-200">
        {history.map((entry) => (
          <div key={entry.id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div
                  className={`flex items-center h-8 w-8 justify-center rounded-full ${
                    entry.action.includes('Added')
                      ? 'bg-green-100 text-green-600'
                      : entry.action.includes('Failed')
                      ? 'bg-red-100 text-red-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {entry.action.includes('Added') ? (
                    <FiCheck className="h-4 w-4" />
                  ) : entry.action.includes('Failed') ? (
                    <FiAlertCircle className="h-4 w-4" />
                  ) : (
                    <FiUser className="h-4 w-4" />
                  )}
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{entry.action}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {Array.isArray(entry.changes) ? (
                    entry.changes.map((change, i) => (
                      <span
                        key={i}
                        className="inline-block bg-gray-100 rounded-md px-2 py-0.5 text-xs text-gray-700 mr-1 mb-1"
                      >
                        {change}
                      </span>
                    ))
                  ) : (
                    entry.changes || ''
                  )}
                </p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <FiClock className="mr-1.5" />
                  <span>{format(new Date(entry.timestamp), 'PPpp')}</span>
                  <span className="mx-2 text-gray-500">•</span>
                  <span className="text-indigo-600">{entry.user}</span>
                  {statuses[entry.id] && (
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                        statuses[entry.id] === 'success'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {statuses[entry.id]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

ConfigurationHistory.propTypes = {
  history: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      action: PropTypes.string,
      changes: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string]),
      timestamp: PropTypes.string,
      user: PropTypes.string
    })
  ).isRequired,
  actions: PropTypes.object,
  statuses: PropTypes.object
};

export default ConfigurationHistory;