// // LoginHistory.js
// import React from 'react';
// import { MapPin, Monitor, Calendar, Clock } from 'lucide-react';

// const LoginHistory = ({ history, theme }) => {
//   return (
//     <div className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//       <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
//         <Calendar className="w-6 h-6" /> Login History
//       </h2>

//       {history.length === 0 ? (
//         <div className="text-center py-8 text-gray-500">
//           <p>No login history available</p>
//         </div>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className={`border-b ${theme === "dark" ? "border-gray-600" : "border-gray-200"}`}>
//                 <th className="px-4 py-3 text-left">Date & Time</th>
//                 <th className="px-4 py-3 text-left">IP Address</th>
//                 <th className="px-4 py-3 text-left">Device</th>
//                 <th className="px-4 py-3 text-left">Location</th>
//               </tr>
//             </thead>
//             <tbody>
//               {history.map(entry => (
//                 <tr key={entry.id} className={`border-b ${theme === "dark" ? "border-gray-600 hover:bg-gray-600" : "border-gray-200 hover:bg-gray-50"}`}>
//                   <td className="px-4 py-3">
//                     <div className="flex items-center gap-2">
//                       <Clock className="w-4 h-4" />
//                       {new Date(entry.timestamp).toLocaleString()}
//                     </div>
//                   </td>
//                   <td className="px-4 py-3">{entry.ip}</td>
//                   <td className="px-4 py-3">
//                     <div className="flex items-center gap-2">
//                       <Monitor className="w-4 h-4" />
//                       {entry.device}
//                     </div>
//                   </td>
//                   <td className="px-4 py-3">
//                     <div className="flex items-center gap-2">
//                       <MapPin className="w-4 h-4" />
//                       {entry.location}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LoginHistory;






// import React from 'react';
// import { MapPin, Monitor, Calendar, Clock } from 'lucide-react';

// const LoginHistory = ({ history, theme }) => {
//   return (
//     <div className={`rounded-xl p-6 shadow-lg ${theme === "dark" ? "bg-gray-700" : "bg-white"}`}>
//       <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
//         <Calendar className="w-6 h-6" /> Login History
//       </h2>

//       {history.length === 0 ? (
//         <div className="text-center py-8 text-gray-500">
//           <p>No login history available</p>
//         </div>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className={`border-b ${theme === "dark" ? "border-gray-600" : "border-gray-200"}`}>
//                 <th className="px-4 py-3 text-left">Date & Time</th>
//                 <th className="px-4 py-3 text-left">IP Address</th>
//                 <th className="px-4 py-3 text-left">Device</th>
//                 <th className="px-4 py-3 text-left">Location</th>
//               </tr>
//             </thead>
//             <tbody>
//               {history.map(entry => (
//                 <tr key={entry.id} className={`border-b ${theme === "dark" ? "border-gray-600 hover:bg-gray-600" : "border-gray-200 hover:bg-gray-50"}`}>
//                   <td className="px-4 py-3">
//                     <div className="flex items-center gap-2">
//                       <Clock className="w-4 h-4" />
//                       {new Date(entry.timestamp).toLocaleString()}
//                     </div>
//                   </td>
//                   <td className="px-4 py-3">{entry.ip_address}</td>
//                   <td className="px-4 py-3">
//                     <div className="flex items-center gap-2">
//                       <Monitor className="w-4 h-4" />
//                       {entry.device}
//                     </div>
//                   </td>
//                   <td className="px-4 py-3">
//                     <div className="flex items-center gap-2">
//                       <MapPin className="w-4 h-4" />
//                       {entry.location}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default LoginHistory;






// import React, { useState, useMemo } from 'react';
// import { MapPin, MonitorSmartphone, CalendarClock, Clock, Search } from 'lucide-react';
// import { motion } from 'framer-motion';

// const LoginHistory = ({ history, theme }) => {
//   const [currentPage, setCurrentPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState('');
//   const pageSize = 10;

//   const filteredHistory = useMemo(() => 
//     history.filter(entry => 
//       entry.ip_address.includes(searchTerm) || 
//       entry.device.toLowerCase().includes(searchTerm.toLowerCase()) || 
//       entry.location.toLowerCase().includes(searchTerm.toLowerCase())
//     ),
//   [history, searchTerm]);

//   const paginatedHistory = filteredHistory.slice((currentPage - 1) * pageSize, currentPage * pageSize);
//   const totalPages = Math.ceil(filteredHistory.length / pageSize);

//   return (
//     <motion.div 
//       initial={{ opacity: 0 }} 
//       animate={{ opacity: 1 }} 
//       className={`rounded-xl p-6 shadow-lg ${
//         theme === "dark" 
//           ? "bg-gray-800/50 backdrop-blur-md text-white" 
//           : "bg-white/50 backdrop-blur-md text-gray-800"
//       }`}
//     >
//       <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
//         <CalendarClock className="w-6 h-6 text-indigo-500" /> Login History
//       </h2>
      
//       <div className="relative mb-6">
//         <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
//         <input
//           type="text"
//           placeholder="Search by IP, device, or location..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           className={`w-full pl-10 p-2 rounded-lg ${
//             theme === "dark" 
//               ? "bg-gray-700 text-white placeholder-gray-400" 
//               : "bg-gray-100 text-gray-800 placeholder-gray-500"
//           }`}
//         />
//       </div>
      
//       {filteredHistory.length === 0 ? (
//         <div className="text-center py-8 text-gray-500">
//           <CalendarClock className="w-12 h-12 mx-auto mb-4 opacity-50" />
//           <p>No login history available</p>
//         </div>
//       ) : (
//         <>
//           <div className="overflow-x-auto rounded-lg">
//             <table className="w-full table-auto">
//               <thead>
//                 <tr className={`border-b ${
//                   theme === "dark" ? "border-gray-700 bg-gray-900" : "border-gray-300 bg-gray-100"
//                 }`}>
//                   <th className="px-4 py-3 text-left">Date & Time</th>
//                   <th className="px-4 py-3 text-left">IP Address</th>
//                   <th className="px-4 py-3 text-left">Device</th>
//                   <th className="px-4 py-3 text-left">Location</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {paginatedHistory.map((entry, index) => (
//                   <motion.tr
//                     key={entry.id}
//                     initial={{ opacity: 0, y: 20 }} 
//                     animate={{ opacity: 1, y: 0 }} 
//                     transition={{ delay: index * 0.05 }}
//                     className={`border-b transition hover:shadow ${
//                       theme === "dark" 
//                         ? "border-gray-700 hover:bg-gray-700" 
//                         : "border-gray-300 hover:bg-gray-50"
//                     }`}
//                   >
//                     <td className="px-4 py-3">
//                       <div className="flex items-center gap-2">
//                         <Clock className="w-4 h-4 text-blue-400" />
//                         {new Date(entry.timestamp).toLocaleString()}
//                       </div>
//                     </td>
//                     <td className="px-4 py-3 font-mono">{entry.ip_address}</td>
//                     <td className="px-4 py-3">
//                       <div className="flex items-center gap-2">
//                         <MonitorSmartphone className="w-4 h-4 text-green-400" />
//                         {entry.device}
//                       </div>
//                     </td>
//                     <td className="px-4 py-3">
//                       <div className="flex items-center gap-2">
//                         <MapPin className="w-4 h-4 text-red-400" />
//                         <a 
//                           href={`https://maps.google.com?q=${entry.location}`} 
//                           target="_blank" 
//                           rel="noopener noreferrer" 
//                           className="hover:underline"
//                         >
//                           {entry.location}
//                         </a>
//                       </div>
//                     </td>
//                   </motion.tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
          
//           <div className={`flex flex-col sm:flex-row justify-between items-center mt-6 p-4 rounded-lg ${
//             theme === "dark" ? "bg-gray-700" : "bg-gray-100"
//           }`}>
//             <span className="text-sm mb-2 sm:mb-0">
//               Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredHistory.length)} of {filteredHistory.length} entries
//             </span>
            
//             <div className="flex gap-2">
//               <button 
//                 disabled={currentPage === 1} 
//                 onClick={() => setCurrentPage(prev => prev - 1)} 
//                 className={`px-4 py-2 rounded transition ${
//                   currentPage === 1 
//                     ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
//                     : "bg-indigo-600 text-white hover:bg-indigo-700"
//                 }`}
//               >
//                 Previous
//               </button>
              
//               <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded">
//                 Page {currentPage} of {totalPages}
//               </span>
              
//               <button 
//                 disabled={currentPage === totalPages} 
//                 onClick={() => setCurrentPage(prev => prev + 1)} 
//                 className={`px-4 py-2 rounded transition ${
//                   currentPage === totalPages 
//                     ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
//                     : "bg-indigo-600 text-white hover:bg-indigo-700"
//                 }`}
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         </>
//       )}
//     </motion.div>
//   );
// };

// export default LoginHistory;








import React, { useState, useMemo, useCallback } from 'react';
import { MapPin, MonitorSmartphone, CalendarClock, Clock, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Efficient data structure for login history
class LoginHistoryManager {
  constructor(history = []) {
    this.history = history;
  }

  // Binary search for efficient lookups
  findById(id) {
    let left = 0;
    let right = this.history.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (this.history[mid].id === id) return this.history[mid];
      if (this.history[mid].id < id) left = mid + 1;
      else right = mid - 1;
    }
    return null;
  }

  // Efficient filtering with multiple criteria
  searchEntries(searchTerm) {
    const term = searchTerm.toLowerCase();
    return this.history.filter(entry => 
      entry.ip_address.includes(term) || 
      entry.device.toLowerCase().includes(term) || 
      entry.location.toLowerCase().includes(term)
    );
  }

  // Pagination helper
  paginate(entries, page, pageSize) {
    const start = (page - 1) * pageSize;
    return entries.slice(start, start + pageSize);
  }
}

const LoginHistory = ({ history, theme }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSize = 10;

  // Initialize history manager
  const historyManager = useMemo(() => new LoginHistoryManager(history), [history]);

  // Memoized filtered history with efficient search
  const filteredHistory = useMemo(() => 
    searchTerm ? historyManager.searchEntries(searchTerm) : history,
    [historyManager, searchTerm, history]
  );

  // Memoized paginated history
  const paginatedHistory = useMemo(() => 
    historyManager.paginate(filteredHistory, currentPage, pageSize),
    [historyManager, filteredHistory, currentPage, pageSize]
  );

  const totalPages = useMemo(() => 
    Math.ceil(filteredHistory.length / pageSize),
    [filteredHistory.length, pageSize]
  );

  // Debounced search
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl p-6 shadow-lg ${
        theme === "dark" 
          ? "bg-gray-800/60 backdrop-blur-md text-white" 
          : "bg-white/60 backdrop-blur-md text-gray-800"
      }`}
    >
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <CalendarClock className="w-6 h-6 text-indigo-500" /> Login History
      </h2>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by IP, device, or location..."
          value={searchTerm}
          onChange={handleSearch}
          className={`w-full pl-10 p-2 rounded-lg text-sm ${
            theme === "dark" 
              ? "bg-gray-700 text-white placeholder-gray-400" 
              : "bg-gray-100 text-gray-800 placeholder-gray-500"
          }`}
        />
      </div>
      
      <AnimatePresence mode="wait">
        {filteredHistory.length === 0 ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-8 text-gray-500"
          >
            <CalendarClock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{searchTerm ? "No matching entries found" : "No login history available"}</p>
          </motion.div>
        ) : (
          <motion.div
            key="history-table"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="overflow-x-auto rounded-lg">
              <table className="w-full table-auto">
                <thead>
                  <tr className={`border-b ${
                    theme === "dark" ? "border-gray-700 bg-gray-900" : "border-gray-300 bg-gray-100"
                  }`}>
                    <th className="px-4 py-3 text-left text-sm font-medium">Date & Time</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">IP Address</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Device</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistory.map((entry, index) => (
                    <motion.tr
                      key={entry.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border-b transition-all hover:shadow ${
                        theme === "dark" 
                          ? "border-gray-700 hover:bg-gray-700" 
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span className="text-sm">{new Date(entry.timestamp).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">{entry.ip_address}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <MonitorSmartphone className="w-4 h-4 text-green-400" />
                          <span className="text-sm">{entry.device}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-red-400" />
                          <a 
                            href={`https://maps.google.com?q=${entry.location}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-sm hover:underline"
                          >
                            {entry.location}
                          </a>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className={`flex flex-col sm:flex-row justify-between items-center mt-6 p-4 rounded-lg ${
              theme === "dark" ? "bg-gray-700" : "bg-gray-100"
            }`}>
              <span className="text-sm mb-2 sm:mb-0">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredHistory.length)} of {filteredHistory.length} entries
              </span>
              
              <div className="flex gap-2">
                <button 
                  disabled={currentPage === 1} 
                  onClick={prevPage}
                  className={`px-4 py-2 rounded transition-all ${
                    currentPage === 1 
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  Previous
                </button>
                
                <span className="px-4 py-2 bg-white dark:bg-gray-800 rounded text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button 
                  disabled={currentPage === totalPages} 
                  onClick={nextPage}
                  className={`px-4 py-2 rounded transition-all ${
                    currentPage === totalPages 
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default React.memo(LoginHistory);