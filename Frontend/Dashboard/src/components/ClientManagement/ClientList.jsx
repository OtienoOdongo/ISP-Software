

// import React, { useMemo } from 'react';
// import { 
//   FiUser, 
//   FiPhone, 
//   FiDollarSign, 
//   FiActivity,
//   FiAlertCircle,
//   FiTrendingUp,
//   FiTrendingDown,
//   FiCheckCircle,
//   FiXCircle,
//   FiChevronLeft,
//   FiChevronRight,
//   FiChevronsLeft,
//   FiChevronsRight
// } from 'react-icons/fi';
// import { FaSpinner } from 'react-icons/fa';
// import { PAGE_SIZES } from '../constants/clientConstants'
// import { formatCurrency, formatDate } from '../../utils/formatters';

// const ClientList = ({
//   clients,
//   selectedClient,
//   onSelectClient,
//   isLoading,
//   pagination,
//   onPageChange,
//   onPageSizeChange,
//   theme
// }) => {
//   const themeClasses = {
//     container: theme === 'dark' 
//       ? 'bg-gray-800 border-gray-700' 
//       : 'bg-white border-gray-200',
//     text: {
//       primary: theme === 'dark' ? 'text-white' : 'text-gray-900',
//       secondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
//       muted: theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
//     },
//     card: {
//       selected: theme === 'dark'
//         ? 'bg-blue-900/30 border-blue-500'
//         : 'bg-blue-50 border-blue-500',
//       default: theme === 'dark'
//         ? 'hover:bg-gray-700 border-gray-600'
//         : 'hover:bg-gray-50 border-gray-200',
//       risk: {
//         high: theme === 'dark' ? 'bg-red-900/20 border-red-800/30' : 'bg-red-50 border-red-200',
//         medium: theme === 'dark' ? 'bg-yellow-900/20 border-yellow-800/30' : 'bg-yellow-50 border-yellow-200',
//         low: theme === 'dark' ? 'bg-green-900/20 border-green-800/30' : 'bg-green-50 border-green-200'
//       }
//     }
//   };

//   // Get risk level color
//   const getRiskColor = (riskScore) => {
//     if (riskScore >= 7) return 'high';
//     if (riskScore >= 4) return 'medium';
//     return 'low';
//   };

//   // Get tier color
//   const getTierColor = (tier) => {
//     const colors = {
//       vip: 'text-purple-500',
//       diamond: 'text-blue-500',
//       platinum: 'text-emerald-500',
//       gold: 'text-yellow-500',
//       silver: 'text-gray-400',
//       bronze: 'text-orange-700',
//       new: 'text-gray-500'
//     };
//     return colors[tier] || 'text-gray-500';
//   };

//   // Format last payment date
//   const formatLastPayment = (client) => {
//     if (!client.last_payment_date) return 'No payments';
//     const days = client.days_since_last_payment || 0;
//     if (days > 30) return `Overdue (${days}d)`;
//     if (days > 14) return `Pending (${days}d)`;
//     return formatDate(client.last_payment_date, 'short');
//   };

//   if (isLoading && clients.length === 0) {
//     return (
//       <div className="flex items-center justify-center py-12">
//         <FaSpinner className="animate-spin text-2xl text-blue-500 mr-3" />
//         <span className={themeClasses.text.secondary}>Loading clients...</span>
//       </div>
//     );
//   }

//   if (clients.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <FiUser className={`text-4xl mx-auto mb-4 ${themeClasses.text.muted}`} />
//         <h3 className={`text-lg font-medium mb-2 ${themeClasses.text.primary}`}>
//           No Clients Found
//         </h3>
//         <p className={themeClasses.text.secondary}>
//           Try adjusting your filters or create a new client
//         </p>
//       </div>
//     );
//   }

//   // Calculate pagination boundaries
//   const startIndex = (pagination.current_page - 1) * pagination.page_size;
//   const endIndex = Math.min(startIndex + pagination.page_size, clients.length);
//   const totalPages = Math.ceil(clients.length / pagination.page_size);

//   return (
//     <div className="space-y-4">
//       {/* Page Controls */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-2">
//             <span className={themeClasses.text.secondary}>Show:</span>
//             <select
//               value={pagination.page_size}
//               onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
//               className={`px-2 py-1 rounded border text-sm ${
//                 theme === 'dark' 
//                   ? 'bg-gray-700 border-gray-600 text-white' 
//                   : 'bg-white border-gray-300 text-gray-900'
//               }`}
//             >
//               {PAGE_SIZES.map(size => (
//                 <option key={size} value={size}>{size}</option>
//               ))}
//             </select>
//             <span className={`text-sm ${themeClasses.text.muted}`}>
//               {startIndex + 1}-{endIndex} of {clients.length}
//             </span>
//           </div>
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => onPageChange(1)}
//               disabled={pagination.current_page === 1}
//               className={`p-2 rounded ${
//                 pagination.current_page === 1
//                   ? 'opacity-50 cursor-not-allowed'
//                   : theme === 'dark'
//                   ? 'hover:bg-gray-700'
//                   : 'hover:bg-gray-200'
//               }`}
//             >
//               <FiChevronsLeft size={16} />
//             </button>

//             <button
//               onClick={() => onPageChange(pagination.current_page - 1)}
//               disabled={pagination.current_page === 1}
//               className={`p-2 rounded ${
//                 pagination.current_page === 1
//                   ? 'opacity-50 cursor-not-allowed'
//                   : theme === 'dark'
//                   ? 'hover:bg-gray-700'
//                   : 'hover:bg-gray-200'
//               }`}
//             >
//               <FiChevronLeft size={16} />
//             </button>
            
//             <span className={`text-sm px-3 ${themeClasses.text.secondary}`}>
//               Page {pagination.current_page} of {totalPages}
//             </span>
            
//             <button
//               onClick={() => onPageChange(pagination.current_page + 1)}
//               disabled={pagination.current_page === totalPages}
//               className={`p-2 rounded ${
//                 pagination.current_page === totalPages
//                   ? 'opacity-50 cursor-not-allowed'
//                   : theme === 'dark'
//                   ? 'hover:bg-gray-700'
//                   : 'hover:bg-gray-200'
//               }`}
//             >
//               <FiChevronRight size={16} />
//             </button>

//             <button
//               onClick={() => onPageChange(totalPages)}
//               disabled={pagination.current_page === totalPages}
//               className={`p-2 rounded ${
//                 pagination.current_page === totalPages
//                   ? 'opacity-50 cursor-not-allowed'
//                   : theme === 'dark'
//                   ? 'hover:bg-gray-700'
//                   : 'hover:bg-gray-200'
//               }`}
//             >
//               <FiChevronsRight size={16} />
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Client Cards */}
//       <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
//         {clients.slice(startIndex, endIndex).map((client) => {
//           const isSelected = selectedClient?.id === client.id;
//           const riskLevel = getRiskColor(client.churn_risk_score);
//           const tierColor = getTierColor(client.tier);

//           return (
//             <div
//               key={client.id}
//               onClick={() => onSelectClient(client)}
//               className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
//                 isSelected 
//                   ? themeClasses.card.selected 
//                   : themeClasses.card.default
//               } ${themeClasses.card.risk[riskLevel]}`}
//             >
//               <div className="flex items-start justify-between mb-2">
//                 <div className="flex-1 min-w-0">
//                   <div className="flex items-center gap-2 mb-1">
//                     <h4 className={`font-medium truncate ${themeClasses.text.primary}`}>
//                       {client.username}
//                     </h4>
//                     {client.is_marketer && (
//                       <span className="px-1.5 py-0.5 text-xs rounded bg-purple-500 text-white">
//                         Marketer
//                       </span>
//                     )}
//                   </div>
                  
//                   <div className="flex items-center gap-3 mb-2 flex-wrap">
//                     <div className="flex items-center gap-1">
//                       <FiPhone size={12} className={themeClasses.text.muted} />
//                       <span className={`text-sm ${themeClasses.text.secondary}`}>
//                         {client.phone_display}
//                       </span>
//                     </div>
                    
//                     <span className={`text-xs font-medium capitalize ${tierColor}`}>
//                       {client.tier_display}
//                     </span>
                    
//                     {client.is_at_risk && (
//                       <div className="flex items-center gap-1">
//                         <FiAlertCircle size={12} className="text-red-500" />
//                         <span className="text-xs text-red-500">At Risk</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
                
//                 {/* Status Indicator */}
//                 <div className="flex-shrink-0">
//                   {client.is_active ? (
//                     <FiCheckCircle size={16} className="text-green-500" />
//                   ) : (
//                     <FiXCircle size={16} className="text-red-500" />
//                   )}
//                 </div>
//               </div>

//               {/* Stats Row */}
//               <div className="grid grid-cols-3 gap-4 text-sm">
//                 <div>
//                   <div className="flex items-center gap-1 mb-1">
//                     <FiDollarSign size={12} className={themeClasses.text.muted} />
//                     <span className={themeClasses.text.secondary}>Revenue</span>
//                   </div>
//                   <div className={`font-medium ${themeClasses.text.primary}`}>
//                     {formatCurrency(client.lifetime_value, 'KES', 0)}
//                   </div>
//                 </div>
                
//                 <div>
//                   <div className="flex items-center gap-1 mb-1">
//                     <FiActivity size={12} className={themeClasses.text.muted} />
//                     <span className={themeClasses.text.secondary}>Risk</span>
//                   </div>
//                   <div className={`font-medium ${
//                     riskLevel === 'high' ? 'text-red-500' :
//                     riskLevel === 'medium' ? 'text-yellow-500' :
//                     'text-green-500'
//                   }`}>
//                     {client.churn_risk_score.toFixed(1)}
//                   </div>
//                 </div>
                
//                 <div>
//                   <div className="flex items-center gap-1 mb-1">
//                     {client.engagement_score >= 5 ? (
//                       <FiTrendingUp size={12} className="text-green-500" />
//                     ) : (
//                       <FiTrendingDown size={12} className="text-red-500" />
//                     )}
//                     <span className={themeClasses.text.secondary}>Engage</span>
//                   </div>
//                   <div className={`font-medium ${
//                     client.engagement_score >= 7 ? 'text-green-500' :
//                     client.engagement_score >= 4 ? 'text-yellow-500' :
//                     'text-red-500'
//                   }`}>
//                     {client.engagement_score.toFixed(1)}
//                   </div>
//                 </div>
//               </div>

//               {/* Additional Info */}
//               <div className="mt-3 pt-3 border-t border-gray-700 dark:border-gray-600 grid grid-cols-2 gap-2 text-xs">
//                 <div>
//                   <span className={themeClasses.text.muted}>Last Payment:</span>
//                   <span className={`ml-1 ${
//                     (client.days_since_last_payment || 0) > 30 ? 'text-red-500' :
//                     (client.days_since_last_payment || 0) > 14 ? 'text-yellow-500' :
//                     themeClasses.text.secondary
//                   }`}>
//                     {formatLastPayment(client)}
//                   </span>
//                 </div>
//                 <div>
//                   <span className={themeClasses.text.muted}>Member Since:</span>
//                   <span className="ml-1">{formatDate(client.customer_since, 'dateOnly')}</span>
//                 </div>
//               </div>

//               {/* Tags */}
//               {client.behavior_tags && client.behavior_tags.length > 0 && (
//                 <div className="flex flex-wrap gap-1 mt-3">
//                   {client.behavior_tags.slice(0, 3).map((tag, index) => (
//                     <span
//                       key={index}
//                       className={`px-2 py-0.5 text-xs rounded-full capitalize ${
//                         theme === 'dark'
//                           ? 'bg-gray-700 text-gray-300'
//                           : 'bg-gray-200 text-gray-700'
//                       }`}
//                     >
//                       {tag.replace('_', ' ')}
//                     </span>
//                   ))}
//                   {client.behavior_tags.length > 3 && (
//                     <span className={`text-xs ${themeClasses.text.muted}`}>
//                       +{client.behavior_tags.length - 3} more
//                     </span>
//                   )}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {/* Bottom Pagination */}
//       {totalPages > 1 && (
//         <div className="flex items-center justify-between pt-4 border-t border-gray-700 dark:border-gray-600">
//           <div className={`text-sm ${themeClasses.text.muted}`}>
//             Showing {startIndex + 1}-{endIndex} of {clients.length} clients
//           </div>
//           <div className="flex gap-1">
//             {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//               let pageNum;
//               if (totalPages <= 5) {
//                 pageNum = i + 1;
//               } else if (pagination.current_page <= 3) {
//                 pageNum = i + 1;
//               } else if (pagination.current_page >= totalPages - 2) {
//                 pageNum = totalPages - 4 + i;
//               } else {
//                 pageNum = pagination.current_page - 2 + i;
//               }

//               return (
//                 <button
//                   key={pageNum}
//                   onClick={() => onPageChange(pageNum)}
//                   className={`w-8 h-8 rounded flex items-center justify-center text-sm ${
//                     pagination.current_page === pageNum
//                       ? theme === 'dark'
//                         ? 'bg-blue-600 text-white'
//                         : 'bg-blue-500 text-white'
//                       : theme === 'dark'
//                       ? 'hover:bg-gray-700'
//                       : 'hover:bg-gray-200'
//                   }`}
//                 >
//                   {pageNum}
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ClientList;








// components/ClientManagement/ClientList.jsx
import React, { useMemo } from 'react';
import {
  FiUser,
  FiPhone,
  FiDollarSign,
  FiActivity,
  FiAlertCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiCheckCircle,
  FiXCircle,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight
} from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';
import { PAGE_SIZES } from '../ClientManagement/constants/clientConstants'
import { formatCurrency, formatDate } from '../ClientManagement/utils/formatters'
import { getThemeClasses } from '../ServiceManagement/Shared/components'


const ClientList = ({
  clients,
  selectedClient,
  onSelectClient,
  isLoading,
  pagination,
  onPageChange,
  onPageSizeChange,
  theme
}) => {
  const themeClasses = getThemeClasses(theme);

  // Get risk level color
  const getRiskColor = (riskScore) => {
    if (riskScore >= 7) return themeClasses.text.danger;
    if (riskScore >= 4) return themeClasses.text.warning;
    return themeClasses.text.success;
  };

  // Get tier color
  const getTierColor = (tier) => {
    const colors = {
      vip: 'text-purple-500',
      diamond: 'text-blue-500',
      platinum: 'text-emerald-500',
      gold: 'text-yellow-500',
      silver: 'text-gray-400',
      bronze: 'text-orange-700',
      new: 'text-gray-500'
    };
    return colors[tier] || 'text-gray-500';
  };

  // Format last payment date
  const formatLastPayment = (client) => {
    if (!client.last_payment_date) return 'No payments';
    const days = client.days_since_last_payment || 0;
    if (days > 30) return `Overdue (${days}d)`;
    if (days > 14) return `Pending (${days}d)`;
    return formatDate(client.last_payment_date, 'short');
  };

  if (isLoading && clients.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-2xl text-blue-500 mr-3" />
        <span className={themeClasses.text.secondary}>Loading clients...</span>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <FiUser className={`text-4xl mx-auto mb-4 ${themeClasses.text.secondary}`} />
        <h3 className={`text-lg font-medium mb-2 ${themeClasses.text.primary}`}>
          No Clients Found
        </h3>
        <p className={themeClasses.text.secondary}>
          Try adjusting your filters or create a new client
        </p>
      </div>
    );
  }

  // Calculate pagination boundaries
  const startIndex = (pagination.current_page - 1) * pagination.page_size;
  const endIndex = Math.min(startIndex + pagination.page_size, clients.length);
  const totalPages = Math.ceil(clients.length / pagination.page_size);

  return (
    <div className="space-y-4">
      {/* Page Controls - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={themeClasses.text.secondary}>Show:</span>
            <select
              value={pagination.page_size}
              onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
              className={`px-2 py-1 rounded border text-sm ${themeClasses.input}`}
            >
              {PAGE_SIZES.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <span className={`text-sm ${themeClasses.text.secondary}`}>
              {startIndex + 1}-{endIndex} of {clients.length}
            </span>
          </div>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2 justify-center sm:justify-end">
            <button
              onClick={() => onPageChange(1)}
              disabled={pagination.current_page === 1}
              className={`p-2 rounded ${pagination.current_page === 1 ? 'opacity-50 cursor-not-allowed' : themeClasses.button.secondary}`}
            >
              <FiChevronsLeft size={16} />
            </button>
            <button
              onClick={() => onPageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className={`p-2 rounded ${pagination.current_page === 1 ? 'opacity-50 cursor-not-allowed' : themeClasses.button.secondary}`}
            >
              <FiChevronLeft size={16} />
            </button>
            <span className={`text-sm px-3 ${themeClasses.text.secondary}`}>
              Page {pagination.current_page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === totalPages}
              className={`p-2 rounded ${pagination.current_page === totalPages ? 'opacity-50 cursor-not-allowed' : themeClasses.button.secondary}`}
            >
              <FiChevronRight size={16} />
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={pagination.current_page === totalPages}
              className={`p-2 rounded ${pagination.current_page === totalPages ? 'opacity-50 cursor-not-allowed' : themeClasses.button.secondary}`}
            >
              <FiChevronsRight size={16} />
            </button>
          </div>
        )}
      </div>
      {/* Client Cards - Scrollable for large lists */}
      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
        {clients.slice(startIndex, endIndex).map((client) => {
          const isSelected = selectedClient?.id === client.id;
          const riskLevel = getRiskColor(client.churn_risk_score);
          const tierColor = getTierColor(client.tier);
          return (
            <div
              key={client.id}
              onClick={() => onSelectClient(client)}
              className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                isSelected ? themeClasses.bg.info : themeClasses.bg.card
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium truncate ${themeClasses.text.primary}`}>
                      {client.username}
                    </h4>
                    {client.is_marketer && (
                      <span className="px-1.5 py-0.5 text-xs rounded bg-purple-500 text-white">
                        Marketer
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <FiPhone size={12} className={themeClasses.text.secondary} />
                      <span className={`text-sm ${themeClasses.text.secondary}`}>
                        {client.phone_display}
                      </span>
                    </div>
                    <span className={`text-xs font-medium capitalize ${tierColor}`}>
                      {client.tier_display}
                    </span>
                    {client.is_at_risk && (
                      <div className="flex items-center gap-1">
                        <FiAlertCircle size={12} className="text-red-500" />
                        <span className="text-xs text-red-500">At Risk</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {client.is_active ? (
                    <FiCheckCircle size={16} className="text-green-500" />
                  ) : (
                    <FiXCircle size={16} className="text-red-500" />
                  )}
                </div>
              </div>
              {/* Stats Row - Responsive Grid */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <FiDollarSign size={12} className={themeClasses.text.secondary} />
                    <span className={themeClasses.text.secondary}>Revenue</span>
                  </div>
                  <div className={`font-medium ${themeClasses.text.primary}`}>
                    {formatCurrency(client.lifetime_value, 'KES', 0)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <FiActivity size={12} className={themeClasses.text.secondary} />
                    <span className={themeClasses.text.secondary}>Risk</span>
                  </div>
                  <div className={`font-medium ${riskLevel}`}>
                    {client.churn_risk_score.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {client.engagement_score >= 5 ? (
                      <FiTrendingUp size={12} className="text-green-500" />
                    ) : (
                      <FiTrendingDown size={12} className="text-red-500" />
                    )}
                    <span className={themeClasses.text.secondary}>Engage</span>
                  </div>
                  <div className={`font-medium ${
                    client.engagement_score >= 7 ? 'text-green-500' :
                    client.engagement_score >= 4 ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {client.engagement_score.toFixed(1)}
                  </div>
                </div>
              </div>
              {/* Additional Info */}
              <div className="mt-3 pt-3 border-t border-gray-700 dark:border-gray-600 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className={themeClasses.text.secondary}>Last Payment:</span>
                  <span className={`ml-1 ${
                    (client.days_since_last_payment || 0) > 30 ? 'text-red-500' :
                    (client.days_since_last_payment || 0) > 14 ? 'text-yellow-500' :
                    themeClasses.text.secondary
                  }`}>
                    {formatLastPayment(client)}
                  </span>
                </div>
                <div>
                  <span className={themeClasses.text.secondary}>Member Since:</span>
                  <span className="ml-1">{formatDate(client.customer_since, 'dateOnly')}</span>
                </div>
              </div>
              {/* Tags */}
              {client.behavior_tags && client.behavior_tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {client.behavior_tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className={`px-2 py-0.5 text-xs rounded-full capitalize ${themeClasses.bg.secondary}`}
                    >
                      {tag.replace('_', ' ')}
                    </span>
                  ))}
                  {client.behavior_tags.length > 3 && (
                    <span className={`text-xs ${themeClasses.text.secondary}`}>
                      +{client.behavior_tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Bottom Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-700 dark:border-gray-600">
          <div className={`text-sm ${themeClasses.text.secondary}`}>
            Showing {startIndex + 1}-{endIndex} of {clients.length} clients
          </div>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.current_page <= 3) {
                pageNum = i + 1;
              } else if (pagination.current_page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = pagination.current_page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-8 h-8 rounded flex items-center justify-center text-sm ${
                    pagination.current_page === pageNum ? themeClasses.button.primary : themeClasses.button.secondary
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;