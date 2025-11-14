// // components/ClientList.jsx
// import React from 'react';
// import { User, ChevronLeft, ChevronRight } from 'lucide-react';
// import { useTheme } from '../../../context/ThemeContext'

// const ClientList = ({ 
//   users, 
//   selectedUser, 
//   onUserSelect, 
//   isLoading, 
//   currentPage, 
//   setCurrentPage, 
//   usersPerPage 
// }) => {
//   const { theme } = useTheme();

//   // Pagination
//   const indexOfLastUser = currentPage * usersPerPage;
//   const indexOfFirstUser = indexOfLastUser - usersPerPage;
//   const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
//   const totalPages = Math.ceil(users.length / usersPerPage);

//   if (isLoading) {
//     return (
//       <div className={`rounded-xl shadow-sm border p-4 ${
//         theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
//       }`}>
//         <div className="animate-pulse space-y-4">
//           {[...Array(5)].map((_, i) => (
//             <div key={i} className="flex items-center gap-3">
//               <div className={`w-10 h-10 rounded-full ${
//                 theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
//               }`}></div>
//               <div className="flex-1">
//                 <div className={`h-4 rounded ${
//                   theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
//                 } mb-2`}></div>
//                 <div className={`h-3 rounded ${
//                   theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
//                 } w-2/3`}></div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`rounded-xl shadow-sm border overflow-hidden transition-colors duration-300 ${
//       theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
//     }`}>
//       {/* Header */}
//       <div className={`p-4 border-b ${
//         theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
//       }`}>
//         <h2 className={`font-semibold flex items-center gap-2 ${
//           theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
//         }`}>
//           <User className="text-blue-500" size={18} />
//           Clients ({users.filter(u => u.active).length}/{users.length})
//         </h2>
//       </div>

//       {/* User List */}
//       <div className={`divide-y ${
//         theme === 'dark' ? 'divide-gray-700' : 'divide-gray-100'
//       }`}>
//         {currentUsers.length > 0 ? (
//           currentUsers.map((user) => (
//             <div
//               key={user.id}
//               className={`p-4 hover:bg-opacity-50 cursor-pointer transition-colors ${
//                 theme === 'dark' 
//                   ? 'hover:bg-gray-700' 
//                   : 'hover:bg-gray-50'
//               } ${
//                 selectedUser?.id === user.id 
//                   ? theme === 'dark' 
//                     ? 'bg-blue-900/20' 
//                     : 'bg-blue-50'
//                   : ''
//               }`}
//               onClick={() => onUserSelect(user)}
//             >
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <div
//                     className={`w-10 h-10 rounded-full flex items-center justify-center ${
//                       user.active 
//                         ? theme === 'dark'
//                           ? 'bg-green-900/20 text-green-400'
//                           : 'bg-green-100 text-green-600'
//                         : theme === 'dark'
//                           ? 'bg-gray-700 text-gray-400'
//                           : 'bg-gray-100 text-gray-500'
//                     }`}
//                   >
//                     <User size={20} />
//                   </div>
//                   <div>
//                     <h3 className={`font-medium ${
//                       theme === 'dark' ? 'text-white' : 'text-gray-800'
//                     }`}>
//                       {user.username}
//                     </h3>
//                     <p className={`text-sm ${
//                       theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//                     }`}>
//                       {user.subscription ? `${user.subscription.plan?.name} Plan` : 'No Plan'}
//                     </p>
//                   </div>
//                 </div>
//                 <ChevronRight className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} size={18} />
//               </div>
              
//               <div className="mt-3 flex items-center justify-between text-sm">
//                 <div className="flex items-center gap-2">
//                   <span
//                     className={`px-2 py-1 rounded-full text-xs ${
//                       user.active 
//                         ? theme === 'dark'
//                           ? 'bg-green-900/20 text-green-400'
//                           : 'bg-green-100 text-green-700'
//                         : theme === 'dark'
//                           ? 'bg-red-900/20 text-red-400'
//                           : 'bg-red-100 text-red-700'
//                     }`}
//                   >
//                     {user.active ? 'Active' : 'Inactive'}
//                   </span>
                  
//                   {user.connection_type && user.connection_type !== 'none' && (
//                     <span className={`px-2 py-1 rounded-full text-xs ${
//                       user.connection_type === 'hotspot'
//                         ? theme === 'dark'
//                           ? 'bg-orange-900/20 text-orange-400'
//                           : 'bg-orange-100 text-orange-700'
//                         : theme === 'dark'
//                         ? 'bg-indigo-900/20 text-indigo-400'
//                         : 'bg-indigo-100 text-indigo-700'
//                     }`}>
//                       {user.connection_type.toUpperCase()}
//                     </span>
//                   )}
//                 </div>
                
//                 <div className="flex flex-col items-end">
//                   <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
//                     {user.phonenumber}
//                   </span>
//                   <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
//                     {user.device && user.device !== 'Unknown' ? user.device : 'No device'}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className={`p-4 text-center ${
//             theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//           }`}>
//             No clients found
//           </div>
//         )}
//       </div>
      
//       {/* Pagination */}
//       {users.length > usersPerPage && (
//         <div className={`p-4 border-t ${
//           theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
//         } flex items-center justify-between`}>
//           <button
//             onClick={() => setCurrentPage(currentPage - 1)}
//             disabled={currentPage === 1}
//             className={`p-2 rounded-md ${
//               currentPage === 1 
//                 ? theme === 'dark' 
//                   ? 'text-gray-600 cursor-not-allowed' 
//                   : 'text-gray-400 cursor-not-allowed'
//                 : theme === 'dark'
//                   ? 'text-gray-300 hover:bg-gray-700'
//                   : 'text-gray-700 hover:bg-gray-100'
//             }`}
//           >
//             <ChevronLeft size={18} />
//           </button>
//           <span className={`text-sm ${
//             theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
//           }`}>
//             Page {currentPage} of {totalPages}
//           </span>
//           <button
//             onClick={() => setCurrentPage(currentPage + 1)}
//             disabled={currentPage === totalPages}
//             className={`p-2 rounded-md ${
//               currentPage === totalPages 
//                 ? theme === 'dark' 
//                   ? 'text-gray-600 cursor-not-allowed' 
//                   : 'text-gray-400 cursor-not-allowed'
//                 : theme === 'dark'
//                   ? 'text-gray-300 hover:bg-gray-700'
//                   : 'text-gray-700 hover:bg-gray-100'
//             }`}
//           >
//             <ChevronRight size={18} />
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ClientList;









// components/ClientList.jsx
import React from 'react';
import { User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext'

const ClientList = ({ 
  users = [], // Add default value
  selectedUser, 
  onUserSelect, 
  isLoading, 
  currentPage, 
  setCurrentPage, 
  usersPerPage = 10 // Add default value
}) => {
  const { theme } = useTheme();

  // Safely handle users data with defaults
  const safeUsers = Array.isArray(users) ? users : [];
  
  // Pagination with safe data
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = safeUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(safeUsers.length / usersPerPage);

  if (isLoading) {
    return (
      <div className={`rounded-xl shadow-sm border p-4 ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`}></div>
              <div className="flex-1">
                <div className={`h-4 rounded ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                } mb-2`}></div>
                <div className={`h-3 rounded ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                } w-2/3`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl shadow-sm border overflow-hidden transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className={`p-4 border-b ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
      }`}>
        <h2 className={`font-semibold flex items-center gap-2 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          <User className="text-blue-500" size={18} />
          Clients ({safeUsers.filter(u => u?.active).length}/{safeUsers.length})
        </h2>
      </div>

      {/* User List */}
      <div className={`divide-y ${
        theme === 'dark' ? 'divide-gray-700' : 'divide-gray-100'
      }`}>
        {currentUsers.length > 0 ? (
          currentUsers.map((user) => (
            <div
              key={user?.id || Math.random()}
              className={`p-4 hover:bg-opacity-50 cursor-pointer transition-colors ${
                theme === 'dark' 
                  ? 'hover:bg-gray-700' 
                  : 'hover:bg-gray-50'
              } ${
                selectedUser?.id === user?.id 
                  ? theme === 'dark' 
                    ? 'bg-blue-900/20' 
                    : 'bg-blue-50'
                  : ''
              }`}
              onClick={() => user && onUserSelect?.(user)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      user?.active 
                        ? theme === 'dark'
                          ? 'bg-green-900/20 text-green-400'
                          : 'bg-green-100 text-green-600'
                        : theme === 'dark'
                          ? 'bg-gray-700 text-gray-400'
                          : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      {user?.username || 'Unknown User'}
                    </h3>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {user?.subscription ? `${user.subscription.plan?.name || 'Unknown'} Plan` : 'No Plan'}
                    </p>
                  </div>
                </div>
                <ChevronRight className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} size={18} />
              </div>
              
              <div className="mt-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      user?.active 
                        ? theme === 'dark'
                          ? 'bg-green-900/20 text-green-400'
                          : 'bg-green-100 text-green-700'
                        : theme === 'dark'
                          ? 'bg-red-900/20 text-red-400'
                          : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {user?.active ? 'Active' : 'Inactive'}
                  </span>
                  
                  {user?.connection_type && user.connection_type !== 'none' && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.connection_type === 'hotspot'
                        ? theme === 'dark'
                          ? 'bg-orange-900/20 text-orange-400'
                          : 'bg-orange-100 text-orange-700'
                        : theme === 'dark'
                        ? 'bg-indigo-900/20 text-indigo-400'
                        : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {user.connection_type.toUpperCase()}
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col items-end">
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                    {user?.phonenumber || 'No phone'}
                  </span>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {user?.device && user.device !== 'Unknown' ? user.device : 'No device'}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={`p-4 text-center ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            No clients found
          </div>
        )}
      </div>
      
      {/* Pagination */}
      {safeUsers.length > usersPerPage && (
        <div className={`p-4 border-t ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
        } flex items-center justify-between`}>
          <button
            onClick={() => setCurrentPage?.(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-md ${
              currentPage === 1 
                ? theme === 'dark' 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-gray-400 cursor-not-allowed'
                : theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft size={18} />
          </button>
          <span className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage?.(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-md ${
              currentPage === totalPages 
                ? theme === 'dark' 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-gray-400 cursor-not-allowed'
                : theme === 'dark'
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ClientList;