



// // components/ClientManagement/ClientList.jsx
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
// import { PAGE_SIZES } from '../ClientManagement/constants/clientConstants'
// import { formatCurrency, formatDate } from '../ClientManagement/utils/formatters'
// import { getThemeClasses } from '../ServiceManagement/Shared/components'


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
//   const themeClasses = getThemeClasses(theme);

//   // Get risk level color
//   const getRiskColor = (riskScore) => {
//     if (riskScore >= 7) return themeClasses.text.danger;
//     if (riskScore >= 4) return themeClasses.text.warning;
//     return themeClasses.text.success;
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
//         <FiUser className={`text-4xl mx-auto mb-4 ${themeClasses.text.secondary}`} />
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
//       {/* Page Controls - Responsive */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-2">
//             <span className={themeClasses.text.secondary}>Show:</span>
//             <select
//               value={pagination.page_size}
//               onChange={(e) => onPageSizeChange(parseInt(e.target.value))}
//               className={`px-2 py-1 rounded border text-sm ${themeClasses.input}`}
//             >
//               {PAGE_SIZES.map(size => (
//                 <option key={size} value={size}>{size}</option>
//               ))}
//             </select>
//             <span className={`text-sm ${themeClasses.text.secondary}`}>
//               {startIndex + 1}-{endIndex} of {clients.length}
//             </span>
//           </div>
//         </div>
//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex items-center gap-2 justify-center sm:justify-end">
//             <button
//               onClick={() => onPageChange(1)}
//               disabled={pagination.current_page === 1}
//               className={`p-2 rounded ${pagination.current_page === 1 ? 'opacity-50 cursor-not-allowed' : themeClasses.button.secondary}`}
//             >
//               <FiChevronsLeft size={16} />
//             </button>
//             <button
//               onClick={() => onPageChange(pagination.current_page - 1)}
//               disabled={pagination.current_page === 1}
//               className={`p-2 rounded ${pagination.current_page === 1 ? 'opacity-50 cursor-not-allowed' : themeClasses.button.secondary}`}
//             >
//               <FiChevronLeft size={16} />
//             </button>
//             <span className={`text-sm px-3 ${themeClasses.text.secondary}`}>
//               Page {pagination.current_page} of {totalPages}
//             </span>
//             <button
//               onClick={() => onPageChange(pagination.current_page + 1)}
//               disabled={pagination.current_page === totalPages}
//               className={`p-2 rounded ${pagination.current_page === totalPages ? 'opacity-50 cursor-not-allowed' : themeClasses.button.secondary}`}
//             >
//               <FiChevronRight size={16} />
//             </button>
//             <button
//               onClick={() => onPageChange(totalPages)}
//               disabled={pagination.current_page === totalPages}
//               className={`p-2 rounded ${pagination.current_page === totalPages ? 'opacity-50 cursor-not-allowed' : themeClasses.button.secondary}`}
//             >
//               <FiChevronsRight size={16} />
//             </button>
//           </div>
//         )}
//       </div>
//       {/* Client Cards - Scrollable for large lists */}
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
//                 isSelected ? themeClasses.bg.info : themeClasses.bg.card
//               }`}
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
//                       <FiPhone size={12} className={themeClasses.text.secondary} />
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
//                 <div className="flex-shrink-0">
//                   {client.is_active ? (
//                     <FiCheckCircle size={16} className="text-green-500" />
//                   ) : (
//                     <FiXCircle size={16} className="text-red-500" />
//                   )}
//                 </div>
//               </div>
//               {/* Stats Row - Responsive Grid */}
//               <div className="grid grid-cols-3 gap-4 text-sm">
//                 <div>
//                   <div className="flex items-center gap-1 mb-1">
//                     <FiDollarSign size={12} className={themeClasses.text.secondary} />
//                     <span className={themeClasses.text.secondary}>Revenue</span>
//                   </div>
//                   <div className={`font-medium ${themeClasses.text.primary}`}>
//                     {formatCurrency(client.lifetime_value, 'KES', 0)}
//                   </div>
//                 </div>
//                 <div>
//                   <div className="flex items-center gap-1 mb-1">
//                     <FiActivity size={12} className={themeClasses.text.secondary} />
//                     <span className={themeClasses.text.secondary}>Risk</span>
//                   </div>
//                   <div className={`font-medium ${riskLevel}`}>
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
//                   <span className={themeClasses.text.secondary}>Last Payment:</span>
//                   <span className={`ml-1 ${
//                     (client.days_since_last_payment || 0) > 30 ? 'text-red-500' :
//                     (client.days_since_last_payment || 0) > 14 ? 'text-yellow-500' :
//                     themeClasses.text.secondary
//                   }`}>
//                     {formatLastPayment(client)}
//                   </span>
//                 </div>
//                 <div>
//                   <span className={themeClasses.text.secondary}>Member Since:</span>
//                   <span className="ml-1">{formatDate(client.customer_since, 'dateOnly')}</span>
//                 </div>
//               </div>
//               {/* Tags */}
//               {client.behavior_tags && client.behavior_tags.length > 0 && (
//                 <div className="flex flex-wrap gap-1 mt-3">
//                   {client.behavior_tags.slice(0, 3).map((tag, index) => (
//                     <span
//                       key={index}
//                       className={`px-2 py-0.5 text-xs rounded-full capitalize ${themeClasses.bg.secondary}`}
//                     >
//                       {tag.replace('_', ' ')}
//                     </span>
//                   ))}
//                   {client.behavior_tags.length > 3 && (
//                     <span className={`text-xs ${themeClasses.text.secondary}`}>
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
//           <div className={`text-sm ${themeClasses.text.secondary}`}>
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
//                     pagination.current_page === pageNum ? themeClasses.button.primary : themeClasses.button.secondary
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










import React, { useState, useMemo } from 'react';
import {
  User, Phone, DollarSign, Activity, AlertCircle,
  TrendingUp, TrendingDown, CheckCircle, XCircle,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Search, Filter, MoreVertical, Eye, Edit, Trash2
} from 'lucide-react';
import { FaSpinner } from 'react-icons/fa';
import Card from '../UI/Card';
import { EnhancedSelect, getThemeClasses } from '../ServiceManagement/Shared/components';
import { formatCurrency, formatDate, formatPhoneNumber } from './utils/formatters'
import { PAGE_SIZES } from './constants/clientConstants'

const ClientList = ({
  clients,
  selectedClient,
  onSelectClient,
  isLoading,
  pagination,
  onPageChange,
  onPageSizeChange,
  onSearch,
  onFilter,
  onExport,
  onDelete,
  theme,
  viewMode = 'list',
  onViewModeChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredClient, setHoveredClient] = useState(null);

  const themeClasses = getThemeClasses(theme);

  // Get risk level color
  const getRiskColor = (score) => {
    if (score >= 7) return 'text-red-500';
    if (score >= 4) return 'text-yellow-500';
    return 'text-green-500';
  };

  // Get risk level background
  const getRiskBg = (score) => {
    if (score >= 7) return themeClasses.bg.danger;
    if (score >= 4) return themeClasses.bg.warning;
    return themeClasses.bg.success;
  };

  // Get tier color
  const getTierColor = (tier) => {
    const colors = {
      vip: 'text-purple-500',
      diamond: 'text-blue-500',
      platinum: 'text-emerald-500',
      gold: 'text-yellow-500',
      silver: 'text-gray-400',
      bronze: 'text-orange-500',
      new: 'text-gray-500'
    };
    return colors[tier] || 'text-gray-500';
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: themeClasses.bg.success, text: 'text-green-700 dark:text-green-300', label: 'Active' },
      inactive: { bg: themeClasses.bg.secondary, text: themeClasses.text.secondary, label: 'Inactive' },
      suspended: { bg: themeClasses.bg.danger, text: 'text-red-700 dark:text-red-300', label: 'Suspended' },
      trial: { bg: themeClasses.bg.warning, text: 'text-yellow-700 dark:text-yellow-300', label: 'Trial' },
      at_risk: { bg: themeClasses.bg.danger, text: 'text-orange-700 dark:text-orange-300', label: 'At Risk' },
      churned: { bg: themeClasses.bg.secondary, text: themeClasses.text.secondary, label: 'Churned' }
    };
    return statusConfig[status] || statusConfig.inactive;
  };

  // Format last payment
  const formatLastPayment = (client) => {
    if (!client.last_payment_date) return 'No payments';
    const days = client.days_since_last_payment || 0;
    if (days > 30) return `Overdue (${days}d)`;
    if (days > 14) return `Pending (${days}d)`;
    return formatDate(client.last_payment_date, 'short');
  };

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch?.(value);
  };

  // Calculate pagination
  const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
  const endIndex = Math.min(startIndex + pagination.pageSize, clients.length);
  const totalPages = Math.ceil(clients.length / pagination.pageSize);

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
        <User size={48} className={`mx-auto mb-4 ${themeClasses.text.secondary}`} />
        <h3 className={`text-lg font-medium mb-2 ${themeClasses.text.primary}`}>
          No Clients Found
        </h3>
        <p className={themeClasses.text.secondary}>
          Try adjusting your filters or create a new client
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search clients..."
            className={`w-full pl-10 pr-4 py-2 rounded-lg border ${themeClasses.input}`}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <button
            onClick={() => onViewModeChange?.(viewMode === 'grid' ? 'list' : 'grid')}
            className={`p-2 rounded ${themeClasses.button.secondary}`}
            title={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
          >
            {viewMode === 'grid' ? 'List' : 'Grid'}
          </button>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded ${themeClasses.button.secondary}`}
          >
            <Filter size={18} />
          </button>

          {/* Page Size Selector */}
          <div className="w-32">
            <EnhancedSelect
              value={pagination.pageSize}
              onChange={onPageSizeChange}
              options={PAGE_SIZES.map(size => ({ value: size, label: `${size} per page` }))}
              theme={theme}
            />
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      {showFilters && (
        <Card theme={theme} className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => onFilter?.('status', 'active')}
              className={`p-2 rounded text-sm ${themeClasses.button.success}`}
            >
              Active Only
            </button>
            <button
              onClick={() => onFilter?.('at_risk', 'true')}
              className={`p-2 rounded text-sm ${themeClasses.button.danger}`}
            >
              At Risk
            </button>
            <button
              onClick={() => onFilter?.('is_marketer', 'true')}
              className={`p-2 rounded text-sm ${themeClasses.button.info}`}
            >
              Marketers
            </button>
            <button
              onClick={() => onFilter?.('connection_type', 'pppoe')}
              className={`p-2 rounded text-sm ${themeClasses.button.secondary}`}
            >
              PPPoE Only
            </button>
          </div>
        </Card>
      )}

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className={`text-sm ${themeClasses.text.secondary}`}>
          Showing {startIndex + 1}-{endIndex} of {clients.length} clients
        </p>
        <button
          onClick={onExport}
          className={`text-sm ${themeClasses.button.secondary} px-3 py-1 rounded`}
        >
          Export All
        </button>
      </div>

      {/* Client List/Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.slice(startIndex, endIndex).map((client) => {
            const isSelected = selectedClient?.id === client.id;
            const statusBadge = getStatusBadge(client.status);
            const riskColor = getRiskColor(client.churn_risk_score);
            const tierColor = getTierColor(client.tier);
            const isHovered = hoveredClient === client.id;

            return (
              <div
                key={client.id}
                onClick={() => onSelectClient(client)}
                onMouseEnter={() => setHoveredClient(client.id)}
                onMouseLeave={() => setHoveredClient(null)}
                className={`relative border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'ring-2 ring-indigo-500'
                    : isHovered
                    ? 'shadow-lg scale-[1.02]'
                    : ''
                } ${themeClasses.bg.card} ${themeClasses.border.light}`}
              >
                {/* Status Indicator */}
                <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${
                  client.status === 'active' ? 'bg-green-500' :
                  client.status === 'suspended' ? 'bg-red-500' :
                  'bg-gray-500'
                }`} />

                {/* Header */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={`p-2 rounded-full ${themeClasses.bg.secondary}`}>
                    <User size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium truncate ${themeClasses.text.primary}`}>
                      {client.username}
                    </h4>
                    <p className={`text-sm truncate ${themeClasses.text.secondary}`}>
                      {client.phone_display}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${statusBadge.bg} ${statusBadge.text}`}>
                    {statusBadge.label}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getRiskBg(client.churn_risk_score)} ${riskColor}`}>
                    Risk: {client.churn_risk_score?.toFixed(1)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${themeClasses.bg.secondary} ${tierColor}`}>
                    {client.tier_display}
                  </span>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className={`text-xs ${themeClasses.text.secondary}`}>Revenue</p>
                    <p className={`font-medium ${themeClasses.text.primary}`}>
                      {client.lifetime_value_formatted}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${themeClasses.text.secondary}`}>Data</p>
                    <p className={`font-medium ${themeClasses.text.primary}`}>
                      {client.total_data_used_formatted}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${themeClasses.text.secondary}`}>Last Payment</p>
                    <p className={`text-sm ${
                      client.days_since_last_payment > 14 ? 'text-red-500' :
                      client.days_since_last_payment > 7 ? 'text-yellow-500' :
                      themeClasses.text.primary
                    }`}>
                      {formatLastPayment(client)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${themeClasses.text.secondary}`}>Member Since</p>
                    <p className={`text-sm ${themeClasses.text.primary}`}>
                      {formatDate(client.customer_since, 'short')}
                    </p>
                  </div>
                </div>

                {/* Hover Actions */}
                {isHovered && (
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectClient(client);
                      }}
                      className={`p-1.5 rounded ${themeClasses.button.info}`}
                      title="View Details"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(client.id);
                      }}
                      className={`p-1.5 rounded ${themeClasses.button.danger}`}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full">
            <thead className={themeClasses.bg.secondary}>
              <tr>
                <th className="p-3 text-left">Client</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Tier</th>
                <th className="p-3 text-left">Revenue</th>
                <th className="p-3 text-left">Risk</th>
                <th className="p-3 text-left">Last Payment</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {clients.slice(startIndex, endIndex).map((client) => {
                const statusBadge = getStatusBadge(client.status);
                const riskColor = getRiskColor(client.churn_risk_score);

                return (
                  <tr
                    key={client.id}
                    onClick={() => onSelectClient(client)}
                    className={`cursor-pointer transition-colors ${
                      selectedClient?.id === client.id
                        ? themeClasses.bg.info
                        : themeClasses.row
                    }`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-full ${themeClasses.bg.secondary}`}>
                          <User size={14} />
                        </div>
                        <div>
                          <p className={`font-medium ${themeClasses.text.primary}`}>
                            {client.username}
                          </p>
                          <p className={`text-xs ${themeClasses.text.secondary}`}>
                            {client.phone_display}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusBadge.bg} ${statusBadge.text}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={getTierColor(client.tier)}>
                        {client.tier_display}
                      </span>
                    </td>
                    <td className="p-3 font-medium">
                      {client.lifetime_value_formatted}
                    </td>
                    <td className="p-3">
                      <span className={riskColor}>
                        {client.churn_risk_score?.toFixed(1)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={
                        client.days_since_last_payment > 14 ? 'text-red-500' :
                        client.days_since_last_payment > 7 ? 'text-yellow-500' :
                        themeClasses.text.primary
                      }>
                        {formatLastPayment(client)}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectClient(client);
                          }}
                          className={`p-1 rounded ${themeClasses.button.info}`}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(client.id);
                          }}
                          className={`p-1 rounded ${themeClasses.button.danger}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
          <div className={`text-sm ${themeClasses.text.secondary}`}>
            Page {pagination.currentPage} of {totalPages}
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(1)}
              disabled={pagination.currentPage === 1}
              className={`p-2 rounded ${
                pagination.currentPage === 1
                  ? 'opacity-50 cursor-not-allowed'
                  : themeClasses.button.secondary
              }`}
            >
              <ChevronsLeft size={18} />
            </button>
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className={`p-2 rounded ${
                pagination.currentPage === 1
                  ? 'opacity-50 cursor-not-allowed'
                  : themeClasses.button.secondary
              }`}
            >
              <ChevronLeft size={18} />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (pagination.currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = pagination.currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-8 h-8 rounded flex items-center justify-center text-sm ${
                      pagination.currentPage === pageNum
                        ? themeClasses.button.primary
                        : themeClasses.button.secondary
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === totalPages}
              className={`p-2 rounded ${
                pagination.currentPage === totalPages
                  ? 'opacity-50 cursor-not-allowed'
                  : themeClasses.button.secondary
              }`}
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={pagination.currentPage === totalPages}
              className={`p-2 rounded ${
                pagination.currentPage === totalPages
                  ? 'opacity-50 cursor-not-allowed'
                  : themeClasses.button.secondary
              }`}
            >
              <ChevronsRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;