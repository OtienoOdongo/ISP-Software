

// import React from 'react';
// import { FiFilter, FiX, FiCalendar, FiDollarSign, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
// import {
//   CLIENT_TIERS,
//   CLIENT_STATUS,
//   CONNECTION_TYPES,
//   REVENUE_SEGMENTS,
//   USAGE_PATTERNS,
//   SORT_OPTIONS
// } from "../ClientManagement/constants/clientConstants"

// const ClientFilters = ({ 
//   filters, 
//   onFilterChange, 
//   onClearFilters, 
//   hasActiveFilters,
//   theme,
//   filterOptions = {}
// }) => {
//   const themeClasses = {
//     input: theme === 'dark'
//       ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
//       : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
//     select: theme === 'dark'
//       ? 'bg-gray-700 border-gray-600 text-white'
//       : 'bg-white border-gray-300 text-gray-900',
//     label: theme === 'dark' ? 'text-gray-300' : 'text-gray-700',
//     card: theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
//   };

//   // Get filter options from props or use defaults
//   const connectionOptions = filterOptions.connection_types || Object.keys(CONNECTION_TYPES);
//   const tierOptions = filterOptions.tiers || Object.keys(CLIENT_TIERS);
//   const revenueOptions = filterOptions.revenue_segments || Object.keys(REVENUE_SEGMENTS);
//   const usageOptions = filterOptions.usage_patterns || Object.keys(USAGE_PATTERNS);

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h3 className={`font-semibold text-lg flex items-center gap-2 ${themeClasses.label}`}>
//           <FiFilter />
//           Filters
//           {hasActiveFilters && (
//             <span className={`text-xs px-2 py-1 rounded-full ${
//               theme === 'dark' 
//                 ? 'bg-blue-600 text-white' 
//                 : 'bg-blue-500 text-white'
//             }`}>
//               Active
//             </span>
//           )}
//         </h3>
//         {hasActiveFilters && (
//           <button
//             onClick={onClearFilters}
//             className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
//           >
//             <FiX size={14} />
//             Clear All
//           </button>
//         )}
//       </div>

//       {/* Search */}
//       <div>
//         <label className={`block text-sm font-medium mb-2 ${themeClasses.label}`}>
//           Search Clients
//         </label>
//         <input
//           type="text"
//           value={filters.search}
//           onChange={(e) => onFilterChange('search', e.target.value)}
//           placeholder="Search by name, phone, or referral code..."
//           className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${themeClasses.input}`}
//         />
//       </div>

//       {/* Quick Filters */}
//       <div className="grid grid-cols-2 gap-3">
//         <div>
//           <label className={`block text-sm font-medium mb-2 ${themeClasses.label}`}>
//             Connection Type
//           </label>
//           <select
//             value={filters.connection_type}
//             onChange={(e) => onFilterChange('connection_type', e.target.value)}
//             className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${themeClasses.select}`}
//           >
//             <option value="all">All Connections</option>
//             {connectionOptions.map((value) => (
//               <option key={value} value={value}>{CONNECTION_TYPES[value] || value}</option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className={`block text-sm font-medium mb-2 ${themeClasses.label}`}>
//             Client Status
//           </label>
//           <select
//             value={filters.status}
//             onChange={(e) => onFilterChange('status', e.target.value)}
//             className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${themeClasses.select}`}
//           >
//             <option value="all">All Status</option>
//             {Object.entries(CLIENT_STATUS).map(([value, label]) => (
//               <option key={value} value={value}>{label}</option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Tier and Revenue Filters */}
//       <div className="grid grid-cols-2 gap-3">
//         <div>
//           <label className={`block text-sm font-medium mb-2 ${themeClasses.label}`}>
//             Client Tier
//           </label>
//           <select
//             value={filters.tier}
//             onChange={(e) => onFilterChange('tier', e.target.value)}
//             className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${themeClasses.select}`}
//           >
//             <option value="all">All Tiers</option>
//             {tierOptions.map((value) => (
//               <option key={value} value={value}>{CLIENT_TIERS[value] || value}</option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className={`block text-sm font-medium mb-2 ${themeClasses.label}`}>
//             Revenue Segment
//           </label>
//           <select
//             value={filters.revenue_segment}
//             onChange={(e) => onFilterChange('revenue_segment', e.target.value)}
//             className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${themeClasses.select}`}
//           >
//             <option value="all">All Segments</option>
//             {revenueOptions.map((value) => (
//               <option key={value} value={value}>{REVENUE_SEGMENTS[value] || value}</option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Usage Pattern Filter */}
//       <div>
//         <label className={`block text-sm font-medium mb-2 ${themeClasses.label}`}>
//           Usage Pattern
//         </label>
//         <select
//           value={filters.usage_pattern}
//           onChange={(e) => onFilterChange('usage_pattern', e.target.value)}
//           className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${themeClasses.select}`}
//         >
//           <option value="all">All Patterns</option>
//           {usageOptions.map((value) => (
//             <option key={value} value={value}>{USAGE_PATTERNS[value] || value}</option>
//           ))}
//         </select>
//       </div>

//       {/* Risk and Attention Filters */}
//       <div className={`p-4 rounded-lg ${themeClasses.card}`}>
//         <h4 className={`font-medium mb-3 ${themeClasses.label}`}>Risk & Attention</h4>
//         <div className="space-y-2">
//           <div className="grid grid-cols-2 gap-3">
//             <label className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 dark:hover:bg-gray-700 cursor-pointer">
//               <input
//                 type="radio"
//                 name="at_risk"
//                 value="all"
//                 checked={filters.at_risk === 'all'}
//                 onChange={(e) => onFilterChange('at_risk', e.target.value)}
//                 className="text-blue-500"
//               />
//               <div>
//                 <span className={themeClasses.label}>All Clients</span>
//                 <span className={`text-xs block ${themeClasses.label}`}>No filter</span>
//               </div>
//             </label>
//             <label className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 dark:hover:bg-gray-700 cursor-pointer">
//               <input
//                 type="radio"
//                 name="at_risk"
//                 value="true"
//                 checked={filters.at_risk === 'true'}
//                 onChange={(e) => onFilterChange('at_risk', e.target.value)}
//                 className="text-red-500"
//               />
//               <div>
//                 <span className={themeClasses.label}>At Risk Only</span>
//                 <div className="flex items-center gap-1 text-xs">
//                   <FiTrendingDown className="text-red-500" size={10} />
//                   <span className={themeClasses.label}>High priority</span>
//                 </div>
//               </div>
//             </label>
//           </div>
          
//           <div className="mt-3 pt-3 border-t border-gray-700 dark:border-gray-600">
//             <label className="flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 checked={filters.needs_attention === 'true'}
//                 onChange={(e) => onFilterChange('needs_attention', e.target.checked ? 'true' : 'all')}
//                 className="text-yellow-500 rounded"
//               />
//               <div>
//                 <span className={themeClasses.label}>Needs Attention</span>
//                 <span className={`text-xs block ${themeClasses.label}`}>Requires follow-up</span>
//               </div>
//             </label>
//           </div>
//         </div>
//       </div>

//       {/* Date Range */}
//       <div>
//         <h4 className={`font-medium mb-3 flex items-center gap-2 ${themeClasses.label}`}>
//           <FiCalendar />
//           Date Range
//         </h4>
//         <div className="grid grid-cols-2 gap-3">
//           <div>
//             <label className={`block text-xs mb-1 ${themeClasses.label}`}>From</label>
//             <input
//               type="date"
//               value={filters.date_from}
//               onChange={(e) => onFilterChange('date_from', e.target.value)}
//               className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${themeClasses.input}`}
//             />
//           </div>
//           <div>
//             <label className={`block text-xs mb-1 ${themeClasses.label}`}>To</label>
//             <input
//               type="date"
//               value={filters.date_to}
//               onChange={(e) => onFilterChange('date_to', e.target.value)}
//               className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${themeClasses.input}`}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Revenue Range */}
//       <div>
//         <h4 className={`font-medium mb-3 flex items-center gap-2 ${themeClasses.label}`}>
//           <FiDollarSign />
//           Revenue Range (KES)
//         </h4>
//         <div className="grid grid-cols-2 gap-3">
//           <div>
//             <label className={`block text-xs mb-1 ${themeClasses.label}`}>Min</label>
//             <input
//               type="number"
//               min="0"
//               step="100"
//               value={filters.min_revenue}
//               onChange={(e) => onFilterChange('min_revenue', e.target.value)}
//               placeholder="0"
//               className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${themeClasses.input}`}
//             />
//           </div>
//           <div>
//             <label className={`block text-xs mb-1 ${themeClasses.label}`}>Max</label>
//             <input
//               type="number"
//               min="0"
//               step="100"
//               value={filters.max_revenue}
//               onChange={(e) => onFilterChange('max_revenue', e.target.value)}
//               placeholder="1000000"
//               className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${themeClasses.input}`}
//             />
//           </div>
//         </div>
//       </div>

//       {/* Sort Options */}
//       <div>
//         <label className={`block text-sm font-medium mb-2 ${themeClasses.label}`}>
//           Sort By
//         </label>
//         <select
//           value={filters.sort_by}
//           onChange={(e) => onFilterChange('sort_by', e.target.value)}
//           className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${themeClasses.select}`}
//         >
//           {SORT_OPTIONS.map(option => (
//             <option key={option.value} value={option.value}>
//               {option.label}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Quick Filter Buttons */}
//       <div className="grid grid-cols-2 gap-2">
//         <button
//           onClick={() => {
//             onFilterChange('at_risk', 'true');
//             onFilterChange('needs_attention', 'true');
//           }}
//           className={`px-3 py-2 rounded-lg text-sm font-medium ${
//             theme === 'dark'
//               ? 'bg-red-900/30 hover:bg-red-800/30 text-red-300'
//               : 'bg-red-100 hover:bg-red-200 text-red-700'
//           }`}
//         >
//           High Risk
//         </button>
//         <button
//           onClick={() => {
//             onFilterChange('status', 'active');
//             onFilterChange('revenue_segment', 'premium');
//           }}
//           className={`px-3 py-2 rounded-lg text-sm font-medium ${
//             theme === 'dark'
//               ? 'bg-green-900/30 hover:bg-green-800/30 text-green-300'
//               : 'bg-green-100 hover:bg-green-200 text-green-700'
//           }`}
//         >
//           Premium Clients
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ClientFilters;





// components/ClientManagement/ClientFilters.jsx
import React from 'react';
import { FiFilter, FiX, FiCalendar, FiDollarSign, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import {
  CLIENT_TIERS,
  CLIENT_STATUS,
  CONNECTION_TYPES,
  REVENUE_SEGMENTS,
  USAGE_PATTERNS,
  SORT_OPTIONS
} from '../ClientManagement/constants/clientConstants'
import { getThemeClasses, EnhancedSelect  } from '../ServiceManagement/Shared/components'


const ClientFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  hasActiveFilters,
  theme,
  filterOptions = {}
}) => {
  const themeClasses = getThemeClasses(theme);

  // Get filter options from props or use defaults
  const connectionOptions = filterOptions.connection_types || Object.entries(CONNECTION_TYPES).map(([value, label]) => ({ value, label }));
  const tierOptions = filterOptions.tiers || Object.entries(CLIENT_TIERS).map(([value, label]) => ({ value, label }));
  const revenueOptions = filterOptions.revenue_segments || Object.entries(REVENUE_SEGMENTS).map(([value, label]) => ({ value, label }));
  const usageOptions = filterOptions.usage_patterns || Object.entries(USAGE_PATTERNS).map(([value, label]) => ({ value, label }));
  const statusOptions = Object.entries(CLIENT_STATUS).map(([value, label]) => ({ value, label }));
  const sortOptions = SORT_OPTIONS.map(option => ({ value: option.value, label: option.label }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold text-lg flex items-center gap-2 ${themeClasses.text.primary}`}>
          <FiFilter />
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
            <FiX size={14} />
            Clear All
          </button>
        )}
      </div>
      {/* Search */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
          Search Clients
        </label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          placeholder="Search by name, phone, or referral code..."
          className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${themeClasses.input}`}
        />
      </div>
      {/* Quick Filters - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
            Connection Type
          </label>
          <EnhancedSelect
            value={filters.connection_type}
            onChange={(value) => onFilterChange('connection_type', value)}
            options={[{ value: 'all', label: 'All Connections' }, ...connectionOptions]}
            theme={theme}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
            Client Status
          </label>
          <EnhancedSelect
            value={filters.status}
            onChange={(value) => onFilterChange('status', value)}
            options={[{ value: 'all', label: 'All Status' }, ...statusOptions]}
            theme={theme}
          />
        </div>
      </div>
      {/* Tier and Revenue Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
            Client Tier
          </label>
          <EnhancedSelect
            value={filters.tier}
            onChange={(value) => onFilterChange('tier', value)}
            options={[{ value: 'all', label: 'All Tiers' }, ...tierOptions]}
            theme={theme}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
            Revenue Segment
          </label>
          <EnhancedSelect
            value={filters.revenue_segment}
            onChange={(value) => onFilterChange('revenue_segment', value)}
            options={[{ value: 'all', label: 'All Segments' }, ...revenueOptions]}
            theme={theme}
          />
        </div>
      </div>
      {/* Usage Pattern Filter */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
          Usage Pattern
        </label>
        <EnhancedSelect
          value={filters.usage_pattern}
          onChange={(value) => onFilterChange('usage_pattern', value)}
          options={[{ value: 'all', label: 'All Patterns' }, ...usageOptions]}
          theme={theme}
        />
      </div>
      {/* Risk and Attention Filters */}
      <div className={`p-4 rounded-lg ${themeClasses.bg.card}`}>
        <h4 className={`font-medium mb-3 ${themeClasses.text.primary}`}>Risk & Attention</h4>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 dark:hover:bg-gray-700 cursor-pointer">
              <input
                type="radio"
                name="at_risk"
                value="all"
                checked={filters.at_risk === 'all'}
                onChange={(e) => onFilterChange('at_risk', e.target.value)}
                className="text-blue-500"
              />
              <div>
                <span className={themeClasses.text.primary}>All Clients</span>
                <span className={`text-xs block ${themeClasses.text.secondary}`}>No filter</span>
              </div>
            </label>
            <label className="flex items-center gap-2 p-2 rounded hover:bg-gray-700 dark:hover:bg-gray-700 cursor-pointer">
              <input
                type="radio"
                name="at_risk"
                value="true"
                checked={filters.at_risk === 'true'}
                onChange={(e) => onFilterChange('at_risk', e.target.value)}
                className="text-red-500"
              />
              <div>
                <span className={themeClasses.text.primary}>At Risk Only</span>
                <div className="flex items-center gap-1 text-xs">
                  <FiTrendingDown className="text-red-500" size={10} />
                  <span className={themeClasses.text.secondary}>High priority</span>
                </div>
              </div>
            </label>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-700 dark:border-gray-600">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.needs_attention === 'true'}
                onChange={(e) => onFilterChange('needs_attention', e.target.checked ? 'true' : 'all')}
                className="text-yellow-500 rounded"
              />
              <div>
                <span className={themeClasses.text.primary}>Needs Attention</span>
                <span className={`text-xs block ${themeClasses.text.secondary}`}>Requires follow-up</span>
              </div>
            </label>
          </div>
        </div>
      </div>
      {/* Date Range */}
      <div>
        <h4 className={`font-medium mb-3 flex items-center gap-2 ${themeClasses.text.primary}`}>
          <FiCalendar />
          Date Range
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>From</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => onFilterChange('date_from', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${themeClasses.input}`}
            />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>To</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => onFilterChange('date_to', e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${themeClasses.input}`}
            />
          </div>
        </div>
      </div>
      {/* Revenue Range */}
      <div>
        <h4 className={`font-medium mb-3 flex items-center gap-2 ${themeClasses.text.primary}`}>
          <FiDollarSign />
          Revenue Range (KES)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>Min</label>
            <input
              type="number"
              min="0"
              step="100"
              value={filters.min_revenue}
              onChange={(e) => onFilterChange('min_revenue', e.target.value)}
              placeholder="0"
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${themeClasses.input}`}
            />
          </div>
          <div>
            <label className={`block text-xs mb-1 ${themeClasses.text.secondary}`}>Max</label>
            <input
              type="number"
              min="0"
              step="100"
              value={filters.max_revenue}
              onChange={(e) => onFilterChange('max_revenue', e.target.value)}
              placeholder="1000000"
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${themeClasses.input}`}
            />
          </div>
        </div>
      </div>
      {/* Sort Options */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${themeClasses.text.secondary}`}>
          Sort By
        </label>
        <EnhancedSelect
          value={filters.sort_by}
          onChange={(value) => onFilterChange('sort_by', value)}
          options={sortOptions}
          theme={theme}
        />
      </div>
      {/* Quick Filter Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <button
          onClick={() => {
            onFilterChange('at_risk', 'true');
            onFilterChange('needs_attention', 'true');
          }}
          className={`px-3 py-2 rounded-lg text-sm font-medium ${themeClasses.button.danger}`}
        >
          High Risk
        </button>
        <button
          onClick={() => {
            onFilterChange('status', 'active');
            onFilterChange('revenue_segment', 'premium');
          }}
          className={`px-3 py-2 rounded-lg text-sm font-medium ${themeClasses.button.success}`}
        >
          Premium Clients
        </button>
      </div>
    </div>
  );
};

export default ClientFilters;