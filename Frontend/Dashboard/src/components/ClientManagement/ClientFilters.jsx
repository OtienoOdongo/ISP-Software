


// import React from 'react';
// import { Filter, X, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
// import { EnhancedSelect, getThemeClasses } from '../ServiceManagement/Shared/components';
// import {
//   CLIENT_TIERS,
//   CLIENT_STATUS,
//   CONNECTION_TYPES,
//   REVENUE_SEGMENTS,
//   USAGE_PATTERNS,
//   SORT_OPTIONS
// } from './constants/clientConstants'

// const ClientFilters = ({
//   filters,
//   onFilterChange,
//   onClearFilters,
//   hasActiveFilters,
//   theme,
//   filterOptions = {}
// }) => {
//   const themeClasses = getThemeClasses(theme);

//   // Prepare options for EnhancedSelect
//   const connectionOptions = [
//     { value: 'all', label: 'All Connections' },
//     ...Object.entries(CONNECTION_TYPES).map(([value, label]) => ({ value, label }))
//   ];

//   const statusOptions = [
//     { value: 'all', label: 'All Status' },
//     ...Object.entries(CLIENT_STATUS).map(([value, label]) => ({ value, label }))
//   ];

//   const tierOptions = [
//     { value: 'all', label: 'All Tiers' },
//     ...Object.entries(CLIENT_TIERS).map(([value, label]) => ({ value, label }))
//   ];

//   const revenueOptions = [
//     { value: 'all', label: 'All Segments' },
//     ...Object.entries(REVENUE_SEGMENTS).map(([value, label]) => ({ value, label }))
//   ];

//   const usageOptions = [
//     { value: 'all', label: 'All Patterns' },
//     ...Object.entries(USAGE_PATTERNS).map(([value, label]) => ({ value, label }))
//   ];

//   const sortOptions = SORT_OPTIONS.map(option => ({
//     value: option.value,
//     label: option.label
//   }));

//   const booleanOptions = [
//     { value: 'all', label: 'All' },
//     { value: 'true', label: 'Yes' },
//     { value: 'false', label: 'No' }
//   ];

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <h3 className={`font-semibold text-lg flex items-center gap-2 ${themeClasses.text.primary}`}>
//           <Filter size={18} />
//           Filters
//           {hasActiveFilters && (
//             <span className={`text-xs px-2 py-1 rounded-full ${themeClasses.bg.info}`}>
//               Active
//             </span>
//           )}
//         </h3>
//         {hasActiveFilters && (
//           <button
//             onClick={onClearFilters}
//             className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
//           >
//             <X size={14} />
//             Clear All
//           </button>
//         )}
//       </div>

//       {/* Search */}
//       <div>
//         <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//           Search Clients
//         </label>
//         <input
//           type="text"
//           value={filters.search || ''}
//           onChange={(e) => onFilterChange('search', e.target.value)}
//           placeholder="Search by name, phone, or referral code..."
//           className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${themeClasses.input}`}
//         />
//       </div>

//       {/* Connection Type - Using EnhancedSelect */}
//       <div>
//         <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//           Connection Type
//         </label>
//         <EnhancedSelect
//           value={filters.connection_type || 'all'}
//           onChange={(value) => onFilterChange('connection_type', value)}
//           options={connectionOptions}
//           theme={theme}
//         />
//       </div>

//       {/* Status - Using EnhancedSelect */}
//       <div>
//         <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//           Status
//         </label>
//         <EnhancedSelect
//           value={filters.status || 'all'}
//           onChange={(value) => onFilterChange('status', value)}
//           options={statusOptions}
//           theme={theme}
//         />
//       </div>

//       {/* Tier - Using EnhancedSelect */}
//       <div>
//         <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//           Tier
//         </label>
//         <EnhancedSelect
//           value={filters.tier || 'all'}
//           onChange={(value) => onFilterChange('tier', value)}
//           options={tierOptions}
//           theme={theme}
//         />
//       </div>

//       {/* Revenue Segment - Using EnhancedSelect */}
//       <div>
//         <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//           Revenue Segment
//         </label>
//         <EnhancedSelect
//           value={filters.revenue_segment || 'all'}
//           onChange={(value) => onFilterChange('revenue_segment', value)}
//           options={revenueOptions}
//           theme={theme}
//         />
//       </div>

//       {/* Usage Pattern - Using EnhancedSelect */}
//       <div>
//         <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//           Usage Pattern
//         </label>
//         <EnhancedSelect
//           value={filters.usage_pattern || 'all'}
//           onChange={(value) => onFilterChange('usage_pattern', value)}
//           options={usageOptions}
//           theme={theme}
//         />
//       </div>

//       {/* Marketer Filter - Using EnhancedSelect */}
//       <div>
//         <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//           Is Marketer
//         </label>
//         <EnhancedSelect
//           value={filters.is_marketer || 'all'}
//           onChange={(value) => onFilterChange('is_marketer', value)}
//           options={booleanOptions}
//           theme={theme}
//         />
//       </div>

//       {/* Risk Filter */}
//       <div className={`p-4 rounded-lg ${themeClasses.bg.card}`}>
//         <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>Risk & Attention</h4>
//         <div className="space-y-3">
//           <div>
//             <label className={`block text-sm mb-2 ${themeClasses.text.secondary}`}>
//               At Risk
//             </label>
//             <EnhancedSelect
//               value={filters.at_risk || 'all'}
//               onChange={(value) => onFilterChange('at_risk', value)}
//               options={booleanOptions}
//               theme={theme}
//             />
//           </div>
//           <div>
//             <label className={`block text-sm mb-2 ${themeClasses.text.secondary}`}>
//               Needs Attention
//             </label>
//             <EnhancedSelect
//               value={filters.needs_attention || 'all'}
//               onChange={(value) => onFilterChange('needs_attention', value)}
//               options={booleanOptions}
//               theme={theme}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Date Range */}
//       <div>
//         <h4 className={`font-medium mb-3 flex items-center gap-2 ${themeClasses.text.primary}`}>
//           <Calendar size={16} />
//           Date Range
//         </h4>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//           <div>
//             <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>From</label>
//             <input
//               type="date"
//               value={filters.date_from || ''}
//               onChange={(e) => onFilterChange('date_from', e.target.value)}
//               className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${themeClasses.input}`}
//             />
//           </div>
//           <div>
//             <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>To</label>
//             <input
//               type="date"
//               value={filters.date_to || ''}
//               onChange={(e) => onFilterChange('date_to', e.target.value)}
//               className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${themeClasses.input}`}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Revenue Range */}
//       <div>
//         <h4 className={`font-medium mb-3 flex items-center gap-2 ${themeClasses.text.primary}`}>
//           <DollarSign size={16} />
//           Revenue Range (KES)
//         </h4>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//           <div>
//             <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>Min</label>
//             <input
//               type="number"
//               min="0"
//               step="100"
//               value={filters.min_revenue || ''}
//               onChange={(e) => onFilterChange('min_revenue', e.target.value)}
//               placeholder="0"
//               className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${themeClasses.input}`}
//             />
//           </div>
//           <div>
//             <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>Max</label>
//             <input
//               type="number"
//               min="0"
//               step="100"
//               value={filters.max_revenue || ''}
//               onChange={(e) => onFilterChange('max_revenue', e.target.value)}
//               placeholder="1000000"
//               className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${themeClasses.input}`}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Sort By - Using EnhancedSelect */}
//       <div>
//         <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
//           Sort By
//         </label>
//         <EnhancedSelect
//           value={filters.sort_by || '-created_at'}
//           onChange={(value) => onFilterChange('sort_by', value)}
//           options={sortOptions}
//           theme={theme}
//         />
//       </div>

//       {/* Quick Filter Buttons */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//         <button
//           onClick={() => {
//             onFilterChange('at_risk', 'true');
//             onFilterChange('needs_attention', 'true');
//           }}
//           className={`px-3 py-2 rounded-lg text-sm font-medium ${themeClasses.button.danger}`}
//         >
//           <TrendingDown size={14} className="inline mr-1" />
//           High Risk
//         </button>
//         <button
//           onClick={() => {
//             onFilterChange('status', 'active');
//             onFilterChange('revenue_segment', 'premium');
//           }}
//           className={`px-3 py-2 rounded-lg text-sm font-medium ${themeClasses.button.success}`}
//         >
//           <TrendingUp size={14} className="inline mr-1" />
//           Premium Clients
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ClientFilters;









import React from 'react';
import { Filter, X, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { EnhancedSelect, getThemeClasses } from '../ServiceManagement/Shared/components';
import {
  CLIENT_TIERS,
  CLIENT_STATUS,
  CONNECTION_TYPES,
  REVENUE_SEGMENTS,
  USAGE_PATTERNS,
  SORT_OPTIONS
} from './constants/clientConstants';

const ClientFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  theme
}) => {
  const themeClasses = getThemeClasses(theme);

  const connectionOptions = [
    { value: 'all', label: 'All Connections' },
    ...Object.entries(CONNECTION_TYPES).map(([value, label]) => ({ value, label }))
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    ...Object.entries(CLIENT_STATUS).map(([value, label]) => ({ value, label }))
  ];

  const tierOptions = [
    { value: 'all', label: 'All Tiers' },
    ...Object.entries(CLIENT_TIERS).map(([value, label]) => ({ value, label }))
  ];

  const revenueOptions = [
    { value: 'all', label: 'All Segments' },
    ...Object.entries(REVENUE_SEGMENTS).map(([value, label]) => ({ value, label }))
  ];

  const usageOptions = [
    { value: 'all', label: 'All Patterns' },
    ...Object.entries(USAGE_PATTERNS).map(([value, label]) => ({ value, label }))
  ];

  const sortOptions = SORT_OPTIONS.map(option => ({
    value: option.value,
    label: option.label
  }));

  const booleanOptions = [
    { value: 'all', label: 'All' },
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold text-lg flex items-center gap-2 ${themeClasses.text.primary}`}>
          <Filter size={18} />
          Filters
          {hasActiveFilters && (
            <span className={`text-xs px-2 py-1 rounded-full ${themeClasses.bg.info}`}>
              Active
            </span>
          )}
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <X size={14} />
            Clear All
          </button>
        )}
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
          Search Clients
        </label>
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => onFilterChange('search', e.target.value)}
          placeholder="Search by name or phone..."
          className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${themeClasses.input}`}
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
          Connection Type
        </label>
        <EnhancedSelect
          value={filters.connection_type || 'all'}
          onChange={(value) => onFilterChange('connection_type', value)}
          options={connectionOptions}
          theme={theme}
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
          Status
        </label>
        <EnhancedSelect
          value={filters.status || 'all'}
          onChange={(value) => onFilterChange('status', value)}
          options={statusOptions}
          theme={theme}
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
          Tier
        </label>
        <EnhancedSelect
          value={filters.tier || 'all'}
          onChange={(value) => onFilterChange('tier', value)}
          options={tierOptions}
          theme={theme}
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
          Revenue Segment
        </label>
        <EnhancedSelect
          value={filters.revenue_segment || 'all'}
          onChange={(value) => onFilterChange('revenue_segment', value)}
          options={revenueOptions}
          theme={theme}
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
          Usage Pattern
        </label>
        <EnhancedSelect
          value={filters.usage_pattern || 'all'}
          onChange={(value) => onFilterChange('usage_pattern', value)}
          options={usageOptions}
          theme={theme}
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
          Is Marketer
        </label>
        <EnhancedSelect
          value={filters.is_marketer || 'all'}
          onChange={(value) => onFilterChange('is_marketer', value)}
          options={booleanOptions}
          theme={theme}
        />
      </div>

      <div className={`p-4 rounded-lg ${themeClasses.bg.card}`}>
        <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>Risk & Attention</h4>
        <div className="space-y-3">
          <div>
            <label className={`block text-sm mb-2 ${themeClasses.text.secondary}`}>
              At Risk
            </label>
            <EnhancedSelect
              value={filters.at_risk || 'all'}
              onChange={(value) => onFilterChange('at_risk', value)}
              options={booleanOptions}
              theme={theme}
            />
          </div>
          <div>
            <label className={`block text-sm mb-2 ${themeClasses.text.secondary}`}>
              Needs Attention
            </label>
            <EnhancedSelect
              value={filters.needs_attention || 'all'}
              onChange={(value) => onFilterChange('needs_attention', value)}
              options={booleanOptions}
              theme={theme}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className={`font-medium mb-3 flex items-center gap-2 ${themeClasses.text.primary}`}>
          <Calendar size={16} />
          Date Range
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>From</label>
            <input
              type="date"
              value={filters.date_from || ''}
              onChange={(e) => onFilterChange('date_from', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${themeClasses.input}`}
            />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>To</label>
            <input
              type="date"
              value={filters.date_to || ''}
              onChange={(e) => onFilterChange('date_to', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${themeClasses.input}`}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className={`font-medium mb-3 flex items-center gap-2 ${themeClasses.text.primary}`}>
          <DollarSign size={16} />
          Revenue Range (KES)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>Min</label>
            <input
              type="number"
              min="0"
              step="100"
              value={filters.min_revenue || ''}
              onChange={(e) => onFilterChange('min_revenue', e.target.value)}
              placeholder="0"
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${themeClasses.input}`}
            />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>Max</label>
            <input
              type="number"
              min="0"
              step="100"
              value={filters.max_revenue || ''}
              onChange={(e) => onFilterChange('max_revenue', e.target.value)}
              placeholder="1000000"
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${themeClasses.input}`}
            />
          </div>
        </div>
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
          Sort By
        </label>
        <EnhancedSelect
          value={filters.sort_by || '-created_at'}
          onChange={(value) => onFilterChange('sort_by', value)}
          options={sortOptions}
          theme={theme}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          onClick={() => {
            onFilterChange('at_risk', 'true');
            onFilterChange('needs_attention', 'true');
          }}
          className={`px-3 py-2 rounded-lg text-sm font-medium ${themeClasses.button.danger}`}
        >
          <TrendingDown size={14} className="inline mr-1" />
          High Risk
        </button>
        <button
          onClick={() => {
            onFilterChange('status', 'active');
            onFilterChange('revenue_segment', 'premium');
          }}
          className={`px-3 py-2 rounded-lg text-sm font-medium ${themeClasses.button.success}`}
        >
          <TrendingUp size={14} className="inline mr-1" />
          Premium Clients
        </button>
      </div>
    </div>
  );
};

export default ClientFilters;